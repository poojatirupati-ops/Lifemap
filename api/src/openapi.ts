import { Scalar } from "@scalar/hono-api-reference";
import type { Hono } from "hono";
import { type DescribeRouteOptions, describeRoute, generateSpecs, resolver } from "hono-openapi";
import { z } from "zod";
import type { Auth } from "./auth";
import type { Env } from "./guard";
import type { Feature } from "./tenant";

const error = (description: string) => ({ description, content: { "application/json": { schema: resolver(z.object({ error: z.string() })) } } });
const ref = (name: string) => ({ $ref: `#/components/responses/${name}` });
export const errors = {
  400: ref("BadRequest"),
  404: ref("NotFound"),
  409: ref("Conflict"),
  413: ref("TooLarge"),
};

/** A route that needs a session in a tenant (the guard: 401 without a session, 403 without an active tenant). `flag`: the tenant feature flag that gates it (403 when off). */
export const doc = ({ flag, ...spec }: DescribeRouteOptions & { flag?: Feature }) =>
  describeRoute({
    security: [{ session: [] }],
    ...spec,
    ...(flag && { description: `${spec.description ?? ""}\n\nGated by the tenant feature flag \`${flag}\` (PostHog, group type \`organization\`; code default without PostHog): 403 when it is off.`.trim() }),
    responses: { 401: ref("Unauthorized"), 403: ref("Forbidden"), ...spec.responses },
  });

/** A route anyone can call (no session). */
export const docPublic = (spec: DescribeRouteOptions) => describeRoute({ security: [], ...spec });

/** GET /api/openapi.json (this app's routes plus Better Auth's /api/auth/* from its openAPI plugin) and GET /api/docs (Scalar). Access is decided by the caller (guard + platform-admin check in production). */
export const mountDocs = (app: Hono<Env>, auth: Auth) => {
  app.get("/api/openapi.json", docPublic({ tags: ["docs"], summary: "This OpenAPI document", responses: { 200: { description: "OpenAPI 3.1 JSON" } } }), async (c) => {
    const authSpec = await auth.api.generateOpenAPISchema();
    const spec = await generateSpecs(app, {
      defaultValidationErrorResponse: false,
      excludeStaticFile: false,
      documentation: {
        info: { title: "LifeMap API", version: "1", description: "Generated from the code (hono-openapi route descriptions and zod schemas; Better Auth openAPI plugin for /api/auth/*). Tenancy: docs/tenancy.md." },
        components: {
          securitySchemes: { session: { type: "apiKey", in: "cookie", name: "better-auth.session_token", description: "Better Auth session cookie (email OTP, passkey or SSO sign-in)" } },
          responses: {
            BadRequest: error("Invalid input"),
            Unauthorized: error("No session"),
            Forbidden: error("No active tenant, not allowed, or the gating feature flag is off"),
            NotFound: error("Not found, or not the caller's in this tenant"),
            Conflict: error("Stale version: the body carries the current `version`"),
            TooLarge: error("Body too large"),
          },
        },
      },
    });
    // Better Auth's paths are relative to its /api/auth base path.
    return c.json({
      ...spec,
      paths: { ...spec.paths, ...Object.fromEntries(Object.entries(authSpec.paths).map(([p, ops]) => [`/api/auth${p}`, ops])) },
      components: { ...spec.components, schemas: { ...spec.components.schemas, ...authSpec.components.schemas } },
    });
  });
  app.get("/api/docs", docPublic({ tags: ["docs"], summary: "Interactive API reference (Scalar)", responses: { 200: { description: "HTML page" } } }), Scalar({ url: "/api/openapi.json", pageTitle: "LifeMap API" }));
};
