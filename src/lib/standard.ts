import type { StandardSchemaV1 } from "@standard-schema/spec";
import { SchemaError } from "@standard-schema/utils";
import type { LooseAutocomplete } from "./utils";

/**
 * Creates a schema that transforms the value.
 */
export const transform = <T, U>(
  transform: (value: T) => U,
): StandardSchemaV1<T, U> => ({
  "~standard": {
    version: 1,
    vendor: "awesome-data-types",
    validate: (value) => ({ value: transform(value as T) }),
  },
});

/**
 * Creates a schema that returns the input value.
 */
export const identity = <T>(): StandardSchemaV1<T> => transform((x) => x);

/**
 * Take a tuple schema and add labels to the arguments.
 */
export const labelArgs = <
  InputArgs extends ReadonlyArray<unknown>,
  OutputArgs extends {
    [K in keyof InputArgs]: unknown;
  } = InputArgs,
>(
  schema: StandardSchemaV1<InputArgs, OutputArgs>,
) => schema;

export function parseSync<Schema extends StandardSchemaV1>(
  schema: Schema,
  value: LooseAutocomplete<StandardSchemaV1.InferInput<Schema>>,
): StandardSchemaV1.InferOutput<Schema> {
  const result = schema["~standard"].validate(value);
  if (result instanceof Promise)
    throw new TypeError("validation must be synchronous");
  if (result.issues) throw new SchemaError(result.issues);
  return result.value;
}

export type StandardSchemaV1Dictionary<
  Input extends Record<string, unknown> = Record<string, unknown>,
  Output extends Record<keyof Input, unknown> = Input,
> = {
  [K in keyof Input]: StandardSchemaV1<Input[K], Output[K]>;
};
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace StandardSchemaV1Dictionary {
  export type InferInput<T extends StandardSchemaV1Dictionary> = {
    [K in keyof T]: StandardSchemaV1.InferInput<T[K]>;
  };
  export type InferOutput<T extends StandardSchemaV1Dictionary> = {
    [K in keyof T]: StandardSchemaV1.InferOutput<T[K]>;
  };
}
