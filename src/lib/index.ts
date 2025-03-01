import type { StandardSchemaV1 } from "@standard-schema/spec";
import * as keys from "./keys";
import { parseSync } from "./standard";
import type {
  ADT,
  ADTStatic,
  ADTValue,
  ADTValueFor,
  ADTVariant,
  UnknownArraySchema,
  UnknownADTValue,
  UnknownVariantMap,
} from "./types";
import { assert } from "./utils";

function makeADTVariant<
  Name extends string,
  Variant extends string,
  VariantSchema extends UnknownArraySchema,
>(
  adtStatic: ADTStatic<Name, UnknownVariantMap>,
  variant: Variant,
  schema: VariantSchema,
): ADTVariant<Name, Variant, VariantSchema> {
  function from(
    input: StandardSchemaV1.InferOutput<VariantSchema>,
  ): ADTValue<Name, Variant, VariantSchema> {
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
    ): ADTValue<Name, Variant, VariantSchema> {
      return from(parseSync(schema, input));
    },
    {
      from: (...args: StandardSchemaV1.InferOutput<VariantSchema>) =>
        from(args),
      schema,
      // dissuade
      [keys.name]: adtStatic[keys.name],
      [keys.variant]: variant,
      [keys.type]: "variant" as const,
    },
  );
}

export function construct<
  const Name extends string,
  const VariantMap extends UnknownVariantMap,
>(name: Name, variants: VariantMap): ADT<Name, VariantMap> {
  const adtStatic: ADTStatic<Name, VariantMap> = {
    [keys.name]: name,
    [keys.type]: "ADT",
  };

  const target = adtStatic as ADT<Name, VariantMap>;

  for (const variant in variants) {
    target[variant] = makeADTVariant(
      adtStatic,
      variant,
      variants[variant] as never,
    ) as never;
  }

  return target;
}

export function matches<
  Name extends string,
  Variant extends string,
  VariantSchema extends UnknownArraySchema,
>(
  variant: ADTVariant<Name, Variant, VariantSchema>,
  value: UnknownADTValue,
): value is ADTValue<Name, Variant, VariantSchema>;
export function matches<
  Name extends string,
  VariantMap extends UnknownVariantMap,
>(
  adt: ADT<Name, VariantMap>,
  value: UnknownADTValue,
): value is ADTValueFor<ADT<Name, VariantMap>>;
export function matches(
  adtOrVariant:
    | ADT<string, UnknownVariantMap>
    | ADTVariant<string, string, UnknownArraySchema>,
  value: UnknownADTValue,
) {
  const nameMatches = adtOrVariant[keys.name] === value[keys.name];
  return adtOrVariant[keys.type] === "variant"
    ? nameMatches && adtOrVariant[keys.variant] === value.variant
    : nameMatches;
}

export function match<
  Value extends UnknownADTValue,
  MatcherResults extends Record<Value["variant"], unknown>,
>(
  value: Value,
  cases: {
    [V in keyof MatcherResults]: (
      ...args: Extract<Value, { variant: V }>["values"]
    ) => MatcherResults[V];
  } & Record<Exclude<keyof MatcherResults, Value["variant"]>, never>,
): MatcherResults[Value["variant"]] {
  const variant = value.variant;
  assert(variant, "value must be an ADT value");
  const matcher = cases[variant as Value["variant"]] as (
    ...values: Value["values"]
  ) => MatcherResults[typeof variant];
  assert(matcher, `missing case for ${variant}`);
  return matcher(...value.values);
}

export function isADTValue(value: unknown): value is UnknownADTValue {
  return (
    typeof value === "object" &&
    value !== null &&
    keys.name in value &&
    keys.type in value &&
    value[keys.type] === "value"
  );
}
