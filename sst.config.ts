/// <reference path="./.sst/platform/config.d.ts" />
// Generated types come from `npx sst install` (run once; needs `npm i -g sst` or npx).

export default $config({
  app(input) {
    return {
      name: "lifemap",
      removal: input.stage === "production" ? "retain" : "remove",
      protect: input.stage === "production", // `sst remove --stage production` refuses
      home: "aws",
      providers: { aws: { region: "eu-west-1" } }, // Ireland, GDPR
    };
  },
  async run() {
    const prod = $app.stage === "production";

    // One customer-managed key per stage for RDS, Performance Insights and both buckets (card P5). Yearly rotation; a deleted key waits 30 days.
    const dataKey = new aws.kms.Key("DataKey", {
      description: `LifeMap ${$app.stage}: RDS and S3 data`,
      enableKeyRotation: true,
      deletionWindowInDays: 30,
    });
    const useDataKey = { actions: ["kms:Decrypt", "kms:GenerateDataKey"], resources: [dataKey.arn] }; // S3 SSE-KMS reads/writes (incl. presigned URLs)

    // Private subnets for RDS and the functions; NAT (ec2 = cheapest) so the functions can still reach SES etc.
    // bastion: reuses the NAT instance (no extra EC2) so `sst tunnel` can reach RDS for migrations (deploy workflow, docs/runbook.md).
    const vpc = new sst.aws.Vpc("Vpc", { nat: "ec2", bastion: true });

    // RDS Postgres, private, behind RDS Proxy (one connection per Lambda instance, README).
    const db = new sst.aws.Postgres("Db", {
      vpc,
      proxy: true,
      // Master password from a Secret so it can be rotated: `sst secret set DbPassword ...` then deploy (docs/runbook.md).
      password: new sst.Secret("DbPassword").value,
      transform: {
        instance: (args) => {
          args.storageEncrypted = true; // at rest with DataKey; snapshots and PITR backups inherit it
          args.kmsKeyId = dataKey.arn;
          args.backupRetentionPeriod = 35; // automated backups + PITR, 35 days (G5 retention)
          args.publiclyAccessible = false;
          args.performanceInsightsEnabled = true; // 7 days (free tier)
          args.performanceInsightsKmsKeyId = dataKey.arn;
          args.iamDatabaseAuthenticationEnabled = true; // for an IAM migration user (docs/runbook.md); the app still uses the Proxy secret
          args.deletionProtection = prod;
          args.skipFinalSnapshot = !prod; // SST skips it by default
          args.finalSnapshotIdentifier = prod ? "lifemap-production-final" : undefined;
        },
        // TLS required server-side (SST's default group sets rds.force_ssl=0).
        parameterGroup: (args) => {
          args.parameters = [{ name: "rds.force_ssl", value: "1" }];
        },
      },
    });

    // Same name and shape as the old Secret, so lambda.ts keeps reading Resource.DatabaseUrl.value.
    // Linked values are encrypted in the function bundle, not plain env vars.
    const databaseUrl = new sst.Linkable("DatabaseUrl", {
      properties: {
        value: $interpolate`postgresql://${db.username.apply(encodeURIComponent)}:${db.password.apply(encodeURIComponent)}@${db.host}:${db.port}/${db.database}?sslmode=verify-full`,
      },
    });
    const authSecret = new sst.Secret("BetterAuthSecret");
    // PostHog (EU) feature flags, evaluated locally in the Api (api/src/tenant.ts): project key + personal API key with feature flag read access.
    const posthogProjectKey = new sst.Secret("PosthogProjectKey");
    const posthogPersonalApiKey = new sst.Secret("PosthogPersonalApiKey");
    const authUrl = new sst.Secret("BetterAuthUrl"); // public https API origin; a Secret only to avoid the url<->env cycle

    // SES sender identity for sign-in codes (eu-west-1). A domain (codes come from noreply@<domain>) or one address; SST creates the
    // identity (and DKIM records to add for a domain) and linking grants the Api ses:SendEmail on it. Not a secret, but stage-specific: set it per deploy.
    const sender = process.env.LIFEMAP_EMAIL_SENDER;
    if (!sender) throw new Error("Set LIFEMAP_EMAIL_SENDER (e.g. lifemap.ie or noreply@lifemap.ie) before deploying");
    const email = new sst.aws.Email("Email", { sender });

    // Uploaded statements and documents (card F3). Private (SST buckets block public access), TLS-only bucket policy (SST's enforceHttps default),
    // SSE-KMS with DataKey. Linking grants the Api s3 access on this bucket only; the browser gets 5-minute presigned URLs for its own <org>/<user>/<id> keys.
    // Unversioned on purpose: a delete or an erasure is final. No expiry rule: the retention table (api/README.md) keeps documents until the user
    // deletes them; when the DPO sets a period add `lifecycle: [{ expiresIn: "<n> days" }]`.
    const documents = new sst.aws.Bucket("Documents");
    new aws.s3.BucketServerSideEncryptionConfigurationV2("DocumentsEncryption", {
      bucket: documents.name,
      rules: [{ applyServerSideEncryptionByDefault: { sseAlgorithm: "aws:kms", kmsMasterKeyId: dataKey.arn }, bucketKeyEnabled: true }],
    });

    const fn = {
      runtime: "nodejs22.x" as const,
      vpc,
      link: [databaseUrl],
      logging: { retention: "1 month" as const }, // CloudWatch 30 days (G5)
      // Lambda's CA bundle incl. the RDS CAs, so sslmode=verify-full verifies the proxy/instance cert.
      environment: { NODE_EXTRA_CA_CERTS: "/var/runtime/ca-cert.pem" },
    };

    // AWS WAF in front of the Api (card S-01): CloudFront Router with SST's WebACL (us-east-1, scope CLOUDFRONT): per-IP rate rule,
    // AWS core, known-bad-inputs and SQLi rule sets, plus AWS Bot Control and a tighter per-IP rule on /api/auth/ added below.
    // OAC with edge signing keeps the function URL private, so WAF cannot be bypassed (the Router adds x-forwarded-host for tenancy).
    const router = new sst.aws.Router("ApiRouter", {
      protection: "oac-with-edge-signing",
      waf: true, // SST defaults: 2000 requests per 5 minutes per IP, all three managed rule sets
      transform: {
        waf: (args) => {
          const visibility = (metricName: string) => ({ cloudwatchMetricsEnabled: true, metricName, sampledRequestsEnabled: true });
          args.rules = $output(args.rules).apply((rules) => [
            ...(rules ?? []),
            {
              // Bot Control, common level (paid AWS managed group: ~$10/month + per request).
              name: "AWSManagedRulesBotControlRuleSet",
              priority: 10,
              overrideAction: { none: {} },
              statement: {
                managedRuleGroupStatement: {
                  vendorName: "AWS",
                  name: "AWSManagedRulesBotControlRuleSet",
                  managedRuleGroupConfigs: [{ awsManagedRulesBotControlRuleSet: { inspectionLevel: "COMMON" } }],
                },
              },
              visibilityConfig: visibility("ApiBotControl"),
            },
            {
              // Auth endpoints: 100 requests per 5 minutes per IP (Better Auth's own per-IP and per-email limits sit behind this).
              name: "AuthRateLimitPerIP",
              priority: 11,
              action: { block: {} },
              statement: {
                rateBasedStatement: {
                  limit: 100,
                  aggregateKeyType: "IP",
                  scopeDownStatement: {
                    byteMatchStatement: {
                      searchString: "/api/auth/",
                      positionalConstraint: "STARTS_WITH",
                      fieldToMatch: { uriPath: {} },
                      textTransformations: [{ priority: 0, type: "LOWERCASE" }],
                    },
                  },
                },
              },
              visibilityConfig: visibility("ApiAuthRateLimitPerIP"),
            },
          ]);
        },
      },
    });

    // Daily retention purge: expired OTP/verification rows and sessions (api/src/jobs/purge.ts).
    const purge = new sst.aws.Cron("Purge", {
      schedule: "rate(1 day)",
      function: { ...fn, handler: "api/src/jobs/purge.handler" },
    });

    // CMS (card C-01, ../docs/cms.md): Payload 3 on Next.js (OpenNext), same RDS in its own `cms` schema, private SSE-KMS media bucket.
    // Versioned so an overwritten or deleted media file can be recovered for 30 days.
    const cmsMedia = new sst.aws.Bucket("CmsMedia", { versioning: true });
    new aws.s3.BucketServerSideEncryptionConfigurationV2("CmsMediaEncryption", {
      bucket: cmsMedia.name,
      rules: [{ applyServerSideEncryptionByDefault: { sseAlgorithm: "aws:kms", kmsMasterKeyId: dataKey.arn }, bucketKeyEnabled: true }],
    });
    new aws.s3.BucketLifecycleConfiguration("CmsMediaOldVersions", {
      bucket: cmsMedia.name,
      rules: [{ id: "expire-old-versions", status: "Enabled", filter: { prefix: "" }, noncurrentVersionExpiration: { noncurrentDays: 30 } }],
    });
    const payloadSecret = new sst.Secret("PayloadSecret");
    const cmsCronSecret = new sst.Secret("CmsCronSecret");
    // ponytail: plain env vars because Payload's config reads process.env; move to Resource links if the CMS ever imports `sst`.
    const cms = new sst.aws.Nextjs("Cms", {
      path: "cms",
      vpc,
      link: [cmsMedia], // IAM for the bucket; Payload's S3 client uses the function role
      permissions: [useDataKey],
      environment: {
        DATABASE_URL: databaseUrl.properties.value,
        PAYLOAD_SECRET: payloadSecret.value,
        CRON_SECRET: cmsCronSecret.value,
        S3_BUCKET: cmsMedia.name,
        CMS_CORS_ORIGINS: authUrl.value, // the app's public origin
        NODE_EXTRA_CA_CERTS: "/var/runtime/ca-cert.pem",
      },
    });
    // Scheduled publish: Payload's jobs run from this cron (autoRun cannot run on Lambda).
    const cmsJobs = new sst.aws.Cron("CmsJobs", {
      schedule: "rate(1 minute)",
      function: {
        handler: "cms/src/cron.handler",
        runtime: "nodejs22.x",
        environment: { CMS_URL: cms.url, CRON_SECRET: cmsCronSecret.value },
      },
    });

    const api = new sst.aws.Function("Api", {
      ...fn,
      handler: "api/src/lambda.handler",
      url: { router: { instance: router } }, // api.url is now the Router's (WAF-protected) URL
      link: [databaseUrl, authSecret, email, documents, posthogProjectKey, posthogPersonalApiKey],
      environment: { ...fn.environment, BETTER_AUTH_URL: authUrl.value, CMS_URL: cms.url }, // CMS_URL: a CORS origin (api/src/app.ts)
      // X-Ray for Powertools Tracer (api/src/observe.ts).
      permissions: [{ actions: ["xray:PutTraceSegments", "xray:PutTelemetryRecords"], resources: ["*"] }, useDataKey],
      transform: { function: { tracingConfig: { mode: "Active" } } },
    });

    // Alarms and one dashboard (card P3), staging and production only. Every alarm goes to the Alerts topic; LIFEMAP_ALERT_EMAIL subscribes
    // one address (AWS emails a confirmation link first). What to do per alarm: docs/runbook.md#alarms.
    if (prod || $app.stage === "staging") {
      const alerts = new aws.sns.Topic("Alerts");
      if (process.env.LIFEMAP_ALERT_EMAIL) {
        new aws.sns.TopicSubscription("AlertsEmail", { topic: alerts.arn, protocol: "email", endpoint: process.env.LIFEMAP_ALERT_EMAIL });
      }
      const region = "eu-west-1";
      // Powertools EMF metrics from api/src/observe.ts. ponytail: namespace has no stage dimension, so staging and production in one AWS account share
      // these lines; separate accounts per stage (recommended) keep them apart.
      const widgets: unknown[] = [
        {
          type: "metric",
          width: 24,
          height: 6,
          properties: {
            title: "Api events (Powertools, per hour)",
            region,
            stat: "Sum",
            period: 3600,
            metrics: ["signIns", "planSaves", "uploads", "bookings", "errors"].map((m) => ["LifeMap", m, "service", "api"]),
          },
        },
      ];
      // Each alarm also gets a dashboard graph of its metric (with the threshold line).
      const alarm = (name: string, title: string, args: Partial<aws.cloudwatch.MetricAlarmArgs>) => {
        const a = new aws.cloudwatch.MetricAlarm(name, {
          alarmDescription: `${title}. Runbook: docs/runbook.md#alarms`,
          comparisonOperator: "GreaterThanOrEqualToThreshold",
          evaluationPeriods: 1,
          period: 300,
          treatMissingData: "notBreaching",
          alarmActions: [alerts.arn],
          ...args,
        });
        widgets.push({ type: "metric", width: 8, height: 6, properties: { title, region, annotations: { alarms: [a.arn] } } });
      };

      // Api through its function URL (behind the Router): 5xx rate and p95 latency.
      const urlMetric = (id: string, metricName: string) => ({
        id,
        returnData: false,
        metric: { namespace: "AWS/Lambda", metricName, dimensions: { FunctionName: api.name }, stat: "Sum", period: 300 },
      });
      alarm("Api5xxRate", "Api 5xx rate (%)", {
        threshold: 5,
        evaluationPeriods: 2,
        metricQueries: [
          urlMetric("errors", "Url5xxCount"),
          urlMetric("requests", "UrlRequestCount"),
          { id: "rate", expression: "IF(requests > 0, 100 * errors / requests, 0)", label: "5xx %", returnData: true },
        ],
      });
      alarm("ApiLatencyP95", "Api p95 latency (ms)", {
        namespace: "AWS/Lambda",
        metricName: "UrlRequestLatency",
        dimensions: { FunctionName: api.name },
        extendedStatistic: "p95",
        threshold: 3000,
        evaluationPeriods: 2,
      });

      // Lambda errors and throttles. Purge errors = the daily retention purge failed (one is enough).
      const lambdas = {
        Api: api.name,
        Purge: purge.nodes.function.name,
        CmsJobs: cmsJobs.nodes.function.name,
        CmsServer: cms.nodes.server!.name,
      };
      for (const [label, functionName] of Object.entries(lambdas)) {
        const lambda = { namespace: "AWS/Lambda", dimensions: { FunctionName: functionName }, statistic: "Sum" };
        alarm(`${label}Errors`, `${label} Lambda errors`, { ...lambda, metricName: "Errors", threshold: label === "Purge" ? 1 : 5 });
        alarm(`${label}Throttles`, `${label} Lambda throttles`, { ...lambda, metricName: "Throttles", threshold: 1 });
      }

      // RDS instance and proxy.
      const rds = { namespace: "AWS/RDS", dimensions: { DBInstanceIdentifier: db.id } };
      alarm("DbCpu", "RDS CPU (%)", { ...rds, metricName: "CPUUtilization", statistic: "Average", threshold: 80, evaluationPeriods: 3 });
      alarm("DbFreeStorage", "RDS free storage (bytes)", {
        ...rds,
        metricName: "FreeStorageSpace",
        statistic: "Minimum",
        threshold: 2 * 1024 ** 3, // 10% of SST's 20 GB
        comparisonOperator: "LessThanOrEqualToThreshold",
      });
      // ~80% of max_connections on SST's default db.t4g.micro; raise with the instance class.
      alarm("DbConnections", "RDS connections", { ...rds, metricName: "DatabaseConnections", statistic: "Maximum", threshold: 70 });
      alarm("DbProxyErrors", "RDS Proxy failed connections to the database", {
        namespace: "AWS/RDS",
        metricName: "DatabaseConnectionsSetupFailed",
        dimensions: { ProxyName: db.proxyId },
        statistic: "Sum",
        threshold: 1,
      });

      // SES account reputation (AWS reviews the account at 5% bounces / 0.1% complaints).
      const ses = { namespace: "AWS/SES", statistic: "Maximum", period: 3600 };
      alarm("SesBounceRate", "SES bounce rate", { ...ses, metricName: "Reputation.BounceRate", threshold: 0.05 });
      alarm("SesComplaintRate", "SES complaint rate", { ...ses, metricName: "Reputation.ComplaintRate", threshold: 0.001 });

      new aws.cloudwatch.Dashboard("Dashboard", { dashboardName: `lifemap-${$app.stage}`, dashboardBody: $jsonStringify({ widgets }) });
    }

    // The app (card P4): static site on its own CloudFront with security headers. Vimeo plays in its iframe (no script host needed);
    // posthog-js/no-external bundles its extensions, so PostHog needs connect-src only. 'unsafe-inline' styles: index.html and the
    // prototype CSS carry inline style blocks/attributes.
    const csp = $interpolate`default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: ${cms.url} https://i.vimeocdn.com; media-src 'self' blob: ${cms.url}; font-src 'self' data:; connect-src 'self' ${api.url} ${cms.url} https://eu.i.posthog.com https://eu-assets.i.posthog.com; frame-src https://player.vimeo.com; worker-src 'self' blob:; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests`;
    const appHeaders = new aws.cloudfront.ResponseHeadersPolicy("AppHeaders", {
      name: `lifemap-${$app.stage}-app-headers`,
      securityHeadersConfig: {
        contentSecurityPolicy: { contentSecurityPolicy: csp, override: true },
        strictTransportSecurity: { accessControlMaxAgeSec: 63072000, includeSubdomains: true, preload: true, override: true },
        frameOptions: { frameOption: "DENY", override: true },
        contentTypeOptions: { override: true },
        referrerPolicy: { referrerPolicy: "strict-origin-when-cross-origin", override: true },
      },
      customHeadersConfig: {
        items: [
          {
            header: "Permissions-Policy",
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(self "https://player.vimeo.com"), autoplay=(self "https://player.vimeo.com")',
            override: true,
          },
          { header: "Cross-Origin-Opener-Policy", value: "same-origin", override: true },
        ],
      },
    });
    const app = new sst.aws.StaticSite("App", {
      path: "app",
      // Source maps are built (vite build.sourcemap 'hidden') and moved out of dist before upload, so they are never served;
      // upload app/dist-maps privately to error tracking from CI.
      build: { command: "npm run build && rm -rf dist-maps && mkdir dist-maps && find dist -name '*.map' -exec mv {} dist-maps/ ';'", output: "dist" },
      environment: { VITE_CMS_URL: cms.url, VITE_POSTHOG_KEY: posthogProjectKey.value }, // the PostHog project key is public by design
      transform: {
        cdn: (args) => {
          args.defaultCacheBehavior = $output([args.defaultCacheBehavior, appHeaders.id]).apply(([behavior, id]) => ({ ...behavior, responseHeadersPolicyId: id }));
        },
      },
    });

    return { url: api.url, cmsUrl: cms.url, appUrl: app.url };
  },
});
