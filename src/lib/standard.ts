import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { UnknownArraySchema } from "./types";
import type { Override } from "./utils";

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
export function labelArgs<
  InputArgs extends ReadonlyArray<unknown>,
  OutputArgs extends {
    [K in keyof InputArgs]: unknown;
  } = InputArgs,
>(): <Schema extends StandardSchemaV1<InputArgs, OutputArgs>>(
  schema: Schema,
) => Override<Schema, StandardSchemaV1<InputArgs, OutputArgs>>;
export function labelArgs<
  InputArgs extends ReadonlyArray<unknown>,
  OutputArgs extends {
    [K in keyof InputArgs]: unknown;
  } = InputArgs,
>(
  schema: StandardSchemaV1<InputArgs, OutputArgs>,
): StandardSchemaV1<InputArgs, OutputArgs>;
export function labelArgs(schema?: UnknownArraySchema) {
  if (schema) return schema;
  return (schema: UnknownArraySchema) => schema;
}
