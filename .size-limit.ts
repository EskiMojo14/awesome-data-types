import type { Check, SizeLimitConfig } from "size-limit";

const entryPoints = {
  ADT: "./dist/index.mjs",
  ADTS: "./dist/schema.mjs",
};

const config = await Promise.all(
  Object.entries(entryPoints).map(async ([name, path]): Promise<Array<Check>> => {
    const imports = await import(path);
    return [
      {
        path,
        import: "*",
        name,
      },
      ...Object.keys(imports).map(
        (key): Check => ({
          path,
          import: `{ ${key} }`,
          name: `${name}.${key}`,
        }),
      ),
    ];
  }),
);

export default config.flat() satisfies SizeLimitConfig;
