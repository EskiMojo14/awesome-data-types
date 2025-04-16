import type { ViteUserConfig } from "vitest/config";
import { defineConfig } from "vitest/config";

export const config: ViteUserConfig = defineConfig({
  test: {
    setupFiles: ["./test-setup.ts"],
    typecheck: {
      enabled: true,
    },
  },
});

export default config;
