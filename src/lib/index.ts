import type { StandardSchemaV1 } from "@standard-schema/spec";
import { nanoid } from "nanoid/non-secure";
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
  Variant extends string,
  VariantSchema extends UnknownArraySchema,
  VariantMap extends UnknownVariantMap,
>(
  adtStatic: ADTStatic,
  variant: Variant,
  schema: VariantSchema,
): ADTVariant<Variant, VariantSchema, VariantMap> {
  function from(
    input: StandardSchemaV1.InferOutput<VariantSchema>,
  ): ADTValue<Variant, VariantSchema, VariantMap> {
    return {
      values: input,
      // internal
      [keys.type]: "value",
      [keys.id]: adtStatic[keys.id],
      [keys.variant]: variant,
    };
  }

  return Object.assign(
    function parse(
      ...input: StandardSchemaV1.InferInput<VariantSchema>
    ): ADTValue<Variant, VariantSchema, VariantMap> {
      return from(parseSync(schema, input));
    },
    {
      from: (...args: StandardSchemaV1.InferOutput<VariantSchema>) =>
        from(args),
      schema,
      // internal
      [keys.id]: adtStatic[keys.id],
      [keys.variant]: variant,
      [keys.type]: "variant" as const,
    },
  );
}

export function construct<const VariantMap extends UnknownVariantMap>(
  variants: VariantMap,
): ADT<VariantMap> {
  const adtStatic: ADTStatic = {
    // internal
    [keys.id]: nanoid(),
    [keys.type]: "ADT",
  };

  const target = adtStatic as ADT<VariantMap>;

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
  Variant extends string,
  VariantSchema extends UnknownArraySchema,
  VariantMap extends UnknownVariantMap,
>(
  variant: ADTVariant<Variant, VariantSchema, VariantMap>,
  value: UnknownADTValue,
): value is ADTValue<Variant, VariantSchema, VariantMap>;
export function matches<VariantMap extends UnknownVariantMap>(
  adt: ADT<VariantMap> | ADTVariant<string, UnknownArraySchema, VariantMap>,
  value: UnknownADTValue,
): value is ADTValueFor<ADT<VariantMap>>;
export function matches(
  adtOrVariant:
    | ADT<UnknownVariantMap>
    | ADTVariant<string, UnknownArraySchema, UnknownVariantMap>,
  value: UnknownADTValue,
) {
  const ADTMatches = adtOrVariant[keys.id] === value[keys.id];
  return adtOrVariant[keys.type] === "variant"
    ? ADTMatches && adtOrVariant[keys.variant] === value[keys.variant]
    : ADTMatches;
}

export function match<
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap & string,
  MatchResults extends Record<NoInfer<Variant>, unknown>,
>(
  value: ADTValue<Variant, VariantMap[Variant], VariantMap>,
  cases: {
    [V in Variant]: (
      ...args: StandardSchemaV1.InferOutput<VariantMap[V]>
    ) => MatchResults[V];
  },
): MatchResults[Variant] {
  const variant = value[keys.variant];
  assert(variant, "value must be an ADT value");
  const matcher = cases[variant];
  assert(matcher, `missing case for ${variant}`);
  return cases[variant](...value.values);
}
