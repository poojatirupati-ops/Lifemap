import { defineConfig } from "vitest/config";

// PGlite boot + migrations + OTP sign-ins are slow on cold or busy machines.
export default defineConfig({ test: { testTimeout: 60_000, hookTimeout: 60_000 } });
