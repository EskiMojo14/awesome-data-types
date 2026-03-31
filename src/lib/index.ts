import type { StandardSchemaV1 } from "@standard-schema/spec";
import * as keys from "./keys";
import { parseSync } from "./standard";
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
} from "./types";
import { assert } from "./utils";

/* #__NO_SIDE_EFFECTS__ */
function makeAdtVariant<
  Name extends string,
  Variant extends string,
  VariantSchema extends UnknownArraySchema,
>(
  adtStatic: AdtStatic<Name, UnknownVariantMap>,
  variant: Variant,
  schema: VariantSchema,
): AdtVariant<Name, Variant, VariantSchema> {
  function from(
    input: StandardSchemaV1.InferOutput<VariantSchema>,
  ): AdtValue<Name, Variant, VariantSchema> {
    return {
      values: input,
      variant,
      // dissuade
      [keys.name]: adtStatic[keys.name],
      [keys.type]: "value",
    };
  }

  return Object.assign(
    function parse(
      ...input: StandardSchemaV1.InferInput<VariantSchema>
    ): AdtValue<Name, Variant, VariantSchema> {
      return from(parseSync(schema, input));
    },
    {
      from: (...args: StandardSchemaV1.InferOutput<VariantSchema>) => from(args),
      schema,
      // dissuade
      [keys.name]: adtStatic[keys.name],
      [keys.variant]: variant,
      [keys.type]: "variant" as const,
    },
  );
}

/* #__NO_SIDE_EFFECTS__ */
export function construct<const Name extends string, const VariantMap extends UnknownVariantMap>(
  name: Name,
  variants: VariantMap,
): Adt<Name, VariantMap> {
  const adtStatic: AdtStatic<Name, VariantMap> = {
    [keys.name]: name,
    [keys.type]: "ADT",
  };

  const target = adtStatic as Adt<Name, VariantMap>;

  for (const variant in variants) {
    target[variant] = makeAdtVariant(adtStatic, variant, variants[variant] as never) as never;
  }

  return target;
}

/* #__NO_SIDE_EFFECTS__ */
export function matches<
  Name extends string,
  Variant extends PropertyKey,
  VariantSchema extends UnknownArraySchema,
>(
  variant: AdtVariant<Name, Variant, VariantSchema>,
  value: UnknownAdtValue,
): value is AdtValue<Name, Variant, VariantSchema>;
export function matches<Name extends string, VariantMap extends UnknownVariantMap>(
  adt: Adt<Name, VariantMap>,
  value: UnknownAdtValue,
): value is AdtValueFor<Adt<Name, VariantMap>>;
export function matches(
  adtOrVariant: Adt<string, any> | AdtVariant<string, PropertyKey, UnknownArraySchema>,
  value: UnknownAdtValue,
) {
  const nameMatches = adtOrVariant[keys.name] === value[keys.name];
  return adtOrVariant[keys.type] === "variant"
    ? nameMatches && adtOrVariant[keys.variant] === value.variant
    : nameMatches;
}

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
