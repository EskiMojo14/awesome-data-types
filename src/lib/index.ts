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
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap & string,
  VariantSchema extends VariantMap[Variant],
>(
  adtStatic: ADTStatic,
  variant: Variant,
  schema: VariantSchema,
): ADTVariant<VariantMap, Variant, VariantSchema> {
  function from(
    input: StandardSchemaV1.InferOutput<VariantSchema>,
  ): ADTValue<VariantMap, Variant, VariantSchema> {
    return {
      values: input,
      // internal
      [keys.id]: adtStatic[keys.id],
      [keys.type]: "value",
      [keys.variant]: variant,
    };
  }

  return Object.assign(
    function parse(
      ...input: StandardSchemaV1.InferInput<VariantSchema>
    ): ADTValue<VariantMap, Variant, VariantSchema> {
      return from(parseSync(schema, input));
    },
    {
      from: (...args: StandardSchemaV1.InferOutput<VariantSchema>) =>
        from(args),
      schema,
      // internal
      [keys.id]: adtStatic[keys.id],
      [keys.type]: "variant" as const,
      [keys.variant]: variant,
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
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap & string,
  VariantSchema extends VariantMap[Variant],
>(
  variant: ADTVariant<VariantMap, Variant, VariantSchema>,
  value: UnknownADTValue,
): value is ADTValue<VariantMap, Variant, VariantSchema>;
export function matches<VariantMap extends UnknownVariantMap>(
  adt: ADT<VariantMap>,
  value: UnknownADTValue,
): value is ADTValueFor<ADT<VariantMap>>;
export function matches(
  adtOrVariant:
    | ADT<UnknownVariantMap>
    | ADTVariant<UnknownVariantMap, string, UnknownArraySchema>,
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
  value: ADTValue<VariantMap, Variant, VariantMap[Variant]>,
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
