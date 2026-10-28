/// <reference path="./.sst/platform/config.d.ts" />
// Generated types come from `npx sst install` (run once; needs `npm i -g sst` or npx).

export default $config({
  app(input) {
    return {
      name: "lifemap",
      removal: input.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: { aws: { region: "eu-west-1" } }, // Ireland, GDPR
    };
  },
  async run() {
    // Private subnets for RDS and the functions; NAT (ec2 = cheapest) so the functions can still reach SES etc.
    const vpc = new sst.aws.Vpc("Vpc", { nat: "ec2" });

    // RDS Postgres, private, behind RDS Proxy (one connection per Lambda instance, README).
    const db = new sst.aws.Postgres("Db", {
      vpc,
      proxy: true,
      transform: {
        instance: (args) => {
          args.storageEncrypted = true; // at rest, AWS-managed KMS key; snapshots inherit it
          args.backupRetentionPeriod = 35; // automated backups + PITR, 35 days (G5 retention)
          args.publiclyAccessible = false;
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
    const authUrl = new sst.Secret("BetterAuthUrl"); // public https API origin; a Secret only to avoid the url<->env cycle

    const fn = {
      runtime: "nodejs22.x" as const,
      vpc,
      link: [databaseUrl],
      logging: { retention: "1 month" as const }, // CloudWatch 30 days (G5)
      // Lambda's CA bundle incl. the RDS CAs, so sslmode=verify-full verifies the proxy/instance cert.
      environment: { NODE_EXTRA_CA_CERTS: "/var/runtime/ca-cert.pem" },
    };

    const api = new sst.aws.Function("Api", {
      ...fn,
      handler: "api/src/lambda.handler",
      url: true,
      link: [databaseUrl, authSecret],
      environment: { ...fn.environment, BETTER_AUTH_URL: authUrl.value },
    });

    // Daily retention purge: expired OTP/verification rows and sessions (api/src/jobs/purge.ts).
    new sst.aws.Cron("Purge", {
      schedule: "rate(1 day)",
      function: { ...fn, handler: "api/src/jobs/purge.handler" },
    });

    return { url: api.url };
  },
});
