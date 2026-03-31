import { defineConfig, type UserConfig } from "vite-plus";

const config: UserConfig = defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      "typescript/array-type": ["error", { default: "generic" }],
      "typescript/consistent-type-imports": "error",
    },
  },
  staged: {
    "*.{ts,md}": "vp fmt",
  },
  pack: {
    entry: ["src/index.ts"],
    sourcemap: true,
    format: ["esm"],
    dts: true,
  },
  fmt: {},
  test: {
    setupFiles: ["./test-setup.ts"],
    typecheck: {
      enabled: true,
    },
  },
});

export default config;
