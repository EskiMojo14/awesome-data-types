import type { StandardSchemaV1 } from "@standard-schema/spec";
import * as keys from "./keys";
import * as standard from "./standard";
import type {
  Adt,
  AdtStatic,
  AdtValue,
  AdtValueFor,
  AdtVariant,
  UnknownArraySchema,
  UnknownAdtValue,
  UnknownVariantMap,
  MatcherResults,
  UnmatchedValues,
  MatcherMap,
  VariantCases,
  AdtVariantBase,
  AdtAsync,
} from "./types";
import { assert } from "./utils";

/* #__NO_SIDE_EFFECTS__ */
function makeAdtVariantBase<
  Name extends string,
  Variant extends string,
  VariantSchema extends UnknownArraySchema,
>(
  name: Name,
  variant: Variant,
  schema: VariantSchema,
): AdtVariantBase<Name, Variant, VariantSchema> {
  return {
    from(
      input: StandardSchemaV1.InferOutput<VariantSchema>,
    ): AdtValue<Name, Variant, VariantSchema> {
      return {
        values: input,
        variant,
        // dissuade
        [keys.name]: name,
        [keys.type]: "value",
      };
    },
    schema,
    // dissuade
    [keys.name]: name,
    [keys.variant]: variant,
    [keys.type]: "variant" as const,
  };
}

/**
 * Creates an ADT from a map of variant schemas.
 * Schema validation _must_ be synchronous. If you need asynchronous validation, use `constructAsync` instead.
 *
 * @param name The name of the ADT. Should be unique.
 * @param variants A map of variant names to schemas.
 * @returns An ADT.
 *
 * @example
 * const Color = ADT.construct("Color", {
 *   Rgb: v.tuple([v.number(), v.number(), v.number()]),
 *   Hex: v.tuple([v.string()]),
 *   Hsl: v.tuple([v.number(), v.number(), v.number()]),
 * });
 *
 * const red = Color.Rgb(255, 0, 0);
 */
/* #__NO_SIDE_EFFECTS__ */
export function construct<const Name extends string, const VariantMap extends UnknownVariantMap>(
  name: Name,
  variants: VariantMap,
): Adt<Name, VariantMap> {
  const target = {
    [keys.name]: name,
    [keys.type]: "ADT",
    [keys.variants]: variants,
  } satisfies AdtStatic<Name, VariantMap> as Adt<Name, VariantMap>;

  for (const variant in variants) {
    const base = makeAdtVariantBase(name, variant, variants[variant]!);
    target[variant] = Object.assign(function parseSync(...input: Array<unknown>): unknown {
      return base.from(standard.parseSync(base.schema, input));
    }, base) as never;
  }

  return target;
}

/**
 * Creates an ADT from a map of variant schemas.
 *
 * @param name The name of the ADT. Should be unique.
 * @param variants A map of variant names to schemas.
 * @returns An ADT.
 *
 * @example
 * const Color = ADT.constructAsync("Color", {
 *   Rgb: z.tuple([z.number(), z.number(), z.number()]),
 *   Hex: z.tuple([z.string()]),
 *   Hsl: z.tuple([z.number(), z.number(), z.number()]),
 * });
 *
 * const red = await Color.Rgb(255, 0, 0);
 */
/* #__NO_SIDE_EFFECTS__ */
export function constructAsync<
  const Name extends string,
  const VariantMap extends UnknownVariantMap,
>(name: Name, variants: VariantMap): AdtAsync<Name, VariantMap> {
  const target = {
    [keys.name]: name,
    [keys.type]: "ADT",
    [keys.variants]: variants,
  } satisfies AdtStatic<Name, VariantMap> as AdtAsync<Name, VariantMap>;

  for (const variant in variants) {
    const base = makeAdtVariantBase(name, variant, variants[variant]!);
    target[variant] = Object.assign(async function parse(
      ...input: Array<unknown>
    ): Promise<unknown> {
      return base.from(await standard.parse(base.schema, input));
    }, base) as never;
  }

  return target;
}

/**
 * Checks if a value matches an ADT variant.
 *
 * @param variant The ADT variant to check.
 * @param value The value to check.
 * @returns Whether the value matches the ADT variant.
 */
export function matches<
  Name extends string,
  Variant extends PropertyKey,
  VariantSchema extends UnknownArraySchema,
>(
  variant: AdtVariant<Name, Variant, VariantSchema>,
  value: UnknownAdtValue,
): value is AdtValue<Name, Variant, VariantSchema>;

/**
 * Checks if a value matches an ADT.
 *
 * @param adt The ADT to check.
 * @param value The value to check.
 * @returns Whether the value matches the ADT.
 */
export function matches<Name extends string, VariantMap extends UnknownVariantMap>(
  adt: Adt<Name, VariantMap>,
  value: UnknownAdtValue,
): value is AdtValueFor<Adt<Name, VariantMap>>;

/* #__NO_SIDE_EFFECTS__ */
export function matches(
  adtOrVariant: Adt<string, any> | AdtVariant<string, PropertyKey, UnknownArraySchema>,
  value: UnknownAdtValue,
) {
  const nameMatches = adtOrVariant[keys.name] === value[keys.name];
  return adtOrVariant[keys.type] === "variant"
    ? nameMatches && adtOrVariant[keys.variant] === value.variant
    : nameMatches;
}

/**
 * Unwraps an ADT value to its variant's values.
 *
 * @param variant The ADT variant to unwrap to.
 * @param value The ADT value to unwrap.
 * @returns The variant's values.
 * @throws If the value does not match the variant.
 */
/* #__NO_SIDE_EFFECTS__ */
export function unwrap<
  Name extends string,
  Variant extends PropertyKey,
  VariantSchema extends UnknownArraySchema,
>(
  variant: AdtVariant<Name, Variant, VariantSchema>,
  value: UnknownAdtValue,
): StandardSchemaV1.InferOutput<VariantSchema> {
  assert(matches(variant, value), "value does not match variant");
  return value.values;
}

/**
 * Matches an ADT value to a pattern, returning the result of the matching case.
 *
 * @param value The ADT value to match.
 * @param cases The pattern to match to.
 * @param catchall A catchall case.
 * @returns The result of the matching case.
 * @throws If the value does not match any case and no catchall is provided.
 */
export function match<
  Value extends UnknownAdtValue,
  Matchers extends MatcherMap<Value>,
  Catchall = never,
>(
  { values, variant }: Value,
  cases: Matchers,
  catchall?: (...args: UnmatchedValues<Value, Matchers>["values"]) => Catchall,
): MatcherResults<Value, Matchers> | Catchall;

/* #__NO_SIDE_EFFECTS__ */
export function match(
  { values, variant }: UnknownAdtValue,
  cases: VariantCases,
  catchall?: (...args: Array<unknown>) => unknown,
): unknown {
  const matcher = cases[variant] ?? catchall;
  assert(matcher, `missing case for ${String(variant)}`);
  return matcher(...values) as never;
}

/**
 * Checks if a value is an ADT value.
 *
 * @param value The value to check.
 * @returns Whether the value is an ADT value.
 */
/* #__NO_SIDE_EFFECTS__ */
export function isAdtValue(value: unknown): value is UnknownAdtValue {
  return (
    typeof value === "object" &&
    value !== null &&
    keys.name in value &&
    keys.type in value &&
    value[keys.type] === "value"
  );
}

/**
 * Parses an unknown value to an ADT value.
 *
 * @param adt The ADT to parse to.
 * @param value The value to parse.
 * @returns The parsed ADT value.
 * @throws If the value is not an ADT value or does not match the ADT.
 */
/* #__NO_SIDE_EFFECTS__ */
export function parse<Name extends string, VariantMap extends UnknownVariantMap>(
  adt: Adt<Name, VariantMap>,
  value: unknown,
): AdtValueFor<Adt<Name, VariantMap>> {
  assert(isAdtValue(value), "value is not an ADT value");
  assert(matches(adt, value), "value does not match ADT");
  return value;
}
