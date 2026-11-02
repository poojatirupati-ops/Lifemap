---
status: ready (after the wave 3 integration pass; before C-CAL, which builds on it)
---
# N-NEST: Hono for HTTP, NestJS as the application layer

Decided with the user (2026-11-02): Hono stays the HTTP layer; NestJS holds the application layer.

- NestJS runs as a standalone application context (`NestFactory.createApplicationContext(AppModule)`, official, no HTTP platform). It is created once per process (once per Lambda cold start) in api/src/app.ts.
- Hono keeps routing, middleware (secure headers, CORS, CSRF, request id, timeout, body limit), the session/tenant/feature guards, hono-openapi + Scalar docs, and `hono/aws-lambda`. Route handlers stay thin: validate, then call a Nest service via `ctx.get(Service)`.
- Nest modules own the logic now in the route files: PlanModule, MeModule, DocumentsModule, BookingsModule, TenantModule, plus DbModule (Drizzle), AuthModule (the Better Auth instance as a provider), MailModule (SES), FilesModule (S3 presign).
- Adapters through DI tokens (cloud agnostic): DocumentReader (http / example), EventBus (eventbridge / memory, CloudEvents via the `cloudevents` SDK), chosen with `useFactory` from env.
- Nest packages that fit without an HTTP platform: @nestjs/config, @nestjs/cqrs (booking events and handlers), @nestjs/schedule only if the purge stays in-process (it is an SST cron today, keep that). Not used: Nest controllers, guards, pipes, @nestjs/swagger, @nestjs/throttler (Hono and WAF cover these).
- Build: SST's esbuild does not emit decorator metadata. Use explicit `@Inject(TOKEN)` on every constructor parameter (no build change), or SWC if that gets noisy.
- Tests keep calling the Hono app (`app.request`); PGlite unchanged.
- Libraries only, no TODOs, ponytail. One check at the end.
- Generators (user, 2026-11-02): create modules/services/providers with `nest g ... --no-spec` (@nestjs/cli, nest-cli.json); schemas from Drizzle tables via drizzle-zod. No hand-written Nest boilerplate.
