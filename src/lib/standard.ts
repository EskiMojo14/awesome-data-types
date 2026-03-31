import type { StandardSchemaV1 } from "@standard-schema/spec";
import { SchemaError } from "@standard-schema/utils";
import type { UnknownArraySchema } from "./types";
import type { LooseAutocomplete, Override } from "./utils";

/**
 * Creates a schema that transforms the value.
 *
 * @param transform The transform function.
 * @returns A schema that transforms the value.
 *
 * @example
 * const schema = transform((x: number) => x + 1);
 * schema["~standard"].validate(1); // { value: 2 }
 */
export const transform = <T, U>(transform: (value: T) => U): StandardSchemaV1<T, U> => ({
  "~standard": {
    version: 1,
    vendor: "awesome-data-types",
    validate: (value) => ({ value: transform(value as T) }),
  },
});

/**
 * Creates a schema that returns the input value.
 *
 * @returns A schema that returns the input value.
 *
 * @example
 * const schema = identity();
 * schema["~standard"].validate(1); // { value: 1 }
 */
export const identity = <T>(): StandardSchemaV1<T> => transform((x) => x);

/**
 * Take a tuple schema and add labels to the arguments.
 *
 * @param schema The schema to label.
 * @returns The labeled schema.
 *
 * @example
 * const schema = labelArgs<[r: number, g: number, b: number]>()(v.tuple([v.number(), v.number(), v.number()]));
 * schema["~standard"].validate([1, 2, 3]); // { value: [1, 2, 3] }
 */
export function labelArgs<
  InputArgs extends ReadonlyArray<unknown>,
  OutputArgs extends {
    [K in keyof InputArgs]: unknown;
  } = InputArgs,
>(): <Schema extends StandardSchemaV1<InputArgs, OutputArgs>>(
  schema: Schema,
) => Override<Schema, StandardSchemaV1<InputArgs, OutputArgs>>;

/**
 * Take a tuple schema and add labels to the arguments.
 *
 * *Prefer the curried form if possible, as it preserves the base schema type.*
 *
 * @param schema The schema to label.
 * @returns The labeled schema.
 *
 * @example
 * const schema = labelArgs(v.tuple([v.number(), v.number(), v.number()]));
 * schema["~standard"].validate([1, 2, 3]); // { value: [1, 2, 3] }
 */
export function labelArgs<
  InputArgs extends ReadonlyArray<unknown>,
  OutputArgs extends {
    [K in keyof InputArgs]: unknown;
  } = InputArgs,
>(schema: StandardSchemaV1<InputArgs, OutputArgs>): StandardSchemaV1<InputArgs, OutputArgs>;

/* #__NO_SIDE_EFFECTS__ */
export function labelArgs(schema?: UnknownArraySchema) {
  if (schema) return schema;
  return (schema: UnknownArraySchema) => schema;
}

/**
 * Parses a value with a schema synchronously.
 *
 * @param schema The schema to parse with.
 * @param value The value to parse.
 * @returns The parsed value.
 * @throws If the validation is asynchronous or fails.
 */
/* #__NO_SIDE_EFFECTS__ */
export function parseSync<Schema extends StandardSchemaV1>(
  schema: Schema,
  value: LooseAutocomplete<StandardSchemaV1.InferInput<Schema>>,
): StandardSchemaV1.InferOutput<Schema> {
  const result = schema["~standard"].validate(value);
  if (result instanceof Promise) throw new TypeError("validation must be synchronous");
  if (result.issues) throw new SchemaError(result.issues);
  return result.value;
}

/**
 * Parses a value with a schema asynchronously.
 *
 * @param schema The schema to parse with.
 * @param value The value to parse.
 * @returns A promise that resolves to the parsed value.
 * @throws If the validation fails.
 */
/* #__NO_SIDE_EFFECTS__ */
export async function parse<Schema extends StandardSchemaV1>(
  schema: Schema,
  value: LooseAutocomplete<StandardSchemaV1.InferInput<Schema>>,
): Promise<StandardSchemaV1.InferOutput<Schema>> {
  const result = await schema["~standard"].validate(value);
  if (result.issues) throw new SchemaError(result.issues);
  return result.value;
}

export type StandardSchemaV1Dictionary<
  Input extends Record<string, unknown> = Record<string, unknown>,
  Output extends Record<keyof Input, unknown> = Input,
> = {
  [K in keyof Input]: StandardSchemaV1<Input[K], Output[K]>;
};
export namespace StandardSchemaV1Dictionary {
  export type InferInput<T extends StandardSchemaV1Dictionary> = {
    [K in keyof T]: StandardSchemaV1.InferInput<T[K]>;
  };
  export type InferOutput<T extends StandardSchemaV1Dictionary> = {
    [K in keyof T]: StandardSchemaV1.InferOutput<T[K]>;
  };
}
