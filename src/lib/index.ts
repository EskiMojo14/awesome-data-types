import type { StandardSchemaV1 } from "@standard-schema/spec";
import { nanoid } from "nanoid/non-secure";
import * as keys from "./keys";
import { parseSync } from "./standard";
import type {
  Enum,
  EnumStatic,
  EnumValue,
  EnumValueFor,
  EnumVariant,
  UnknownArraySchema,
  UnknownEnumValue,
  UnknownVariantMap,
} from "./types";
import { assert } from "./utils";

function makeEnumVariant<
  Variant extends string,
  VariantSchema extends UnknownArraySchema,
  VariantMap extends UnknownVariantMap,
>(
  enumStatic: EnumStatic,
  variant: Variant,
  schema: VariantSchema,
): EnumVariant<Variant, VariantSchema, VariantMap> {
  function from(
    input: StandardSchemaV1.InferOutput<VariantSchema>,
  ): EnumValue<Variant, VariantSchema, VariantMap> {
    return {
      [keys.type]: "value",
      [keys.id]: enumStatic[keys.id],
      [keys.variant]: variant,
      values: input,
    };
  }

  return Object.assign(
    function parse(
      ...input: StandardSchemaV1.InferInput<VariantSchema>
    ): EnumValue<Variant, VariantSchema, VariantMap> {
      return from(parseSync(schema, input));
    },
    {
      from: (...args: StandardSchemaV1.InferOutput<VariantSchema>) =>
        from(args),
      schema,
      [keys.id]: enumStatic[keys.id],
      [keys.variant]: variant,
      [keys.type]: "variant" as const,
    },
  );
}

export function construct<const VariantMap extends UnknownVariantMap>(
  variants: VariantMap,
): Enum<VariantMap> {
  const enumStatic: EnumStatic = {
    [keys.id]: nanoid(),
    [keys.type]: "enum",
  };

  const target = enumStatic as Enum<VariantMap>;

  for (const variant in variants) {
    target[variant] = makeEnumVariant(
      enumStatic,
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
  variant: EnumVariant<Variant, VariantSchema, VariantMap>,
  value: UnknownEnumValue,
): value is EnumValue<Variant, VariantSchema, VariantMap>;
export function matches<VariantMap extends UnknownVariantMap>(
  en: Enum<VariantMap> | EnumVariant<string, UnknownArraySchema, VariantMap>,
  value: UnknownEnumValue,
): value is EnumValueFor<Enum<VariantMap>>;
export function matches(
  enOrVariant:
    | Enum<UnknownVariantMap>
    | EnumVariant<string, UnknownArraySchema, UnknownVariantMap>,
  value: UnknownEnumValue,
) {
  const enumMatches = enOrVariant[keys.id] === value[keys.id];
  return enOrVariant[keys.type] === "variant"
    ? enumMatches && enOrVariant[keys.variant] === value[keys.variant]
    : enumMatches;
}

export function match<
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap & string,
  MatchResults extends Record<NoInfer<Variant>, unknown>,
>(
  value: EnumValue<Variant, VariantMap[Variant], VariantMap>,
  cases: {
    [V in Variant]: (
      ...args: StandardSchemaV1.InferOutput<VariantMap[V]>
    ) => MatchResults[V];
  },
): MatchResults[Variant] {
  const variant = value[keys.variant];
  assert(variant, "value must be an enum value");
  const matcher = cases[variant];
  assert(matcher, `missing case for ${variant}`);
  return cases[variant](...value.values);
}
