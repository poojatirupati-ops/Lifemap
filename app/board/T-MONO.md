# Monorepo with Turborepo
status: todo
deps: runs when no agent is editing app/, api/ or cms/ (install rewrites node_modules)
files: package.json, turbo.json (added), package-lock.json, app|api|cms package.json, packages/*

## Goal
- Root npm workspaces (app, api, cms, packages/*) with Turborepo 2 tasks build, test, lint, dev (root package.json and turbo.json are already written).
- Run one `npm install` at the root: one root package-lock.json, delete the per-project lockfiles and node_modules first.
- packages/shared: the saved-plan zod schema and the API response types used by both app and api (replaces the app-to-api type coupling), consumed as a workspace package.
- packages/config: shared tsconfig base and Prettier config.
- Keep the folder names app, api, cms (no move to apps/* now; renaming later is a one-line workspace change plus import paths).
- SST config keeps working from the root.

## Done when
`npx turbo run build test lint` passes for all workspaces from the root; dev servers start with `npx turbo run dev`; one lockfile.
