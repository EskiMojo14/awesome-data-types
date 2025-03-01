import type { StandardSchemaV1 } from "@standard-schema/spec";
import { nanoid } from "nanoid/non-secure";
import * as keys from "./keys";
import { parseSync } from "./standard";
import type {
  UnknownVariantMap,
  EnumValue,
  UnknownEnumValue,
  EnumVariant,
  Enum,
  EnumStatic,
  VariantMatchers,
  EnumValueFor,
} from "./types";
import { assert } from "./utils";

function matchesEnum<VariantMap extends UnknownVariantMap>(
  en: EnumStatic<VariantMap>,
  value: UnknownEnumValue,
): value is EnumValueFor<Enum<VariantMap>> {
  return value[keys.id] === en[keys.id];
}

function matchesVariant<
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap & string,
>(
  en: EnumStatic<VariantMap>,
  variant: Variant,
  value: UnknownEnumValue,
): value is EnumValue<Variant, VariantMap[Variant]> {
  return value[keys.id] === en[keys.id] && value[keys.variant] === variant;
}

function makeEnumVariant<
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap & string,
>(
  enumStatic: EnumStatic<VariantMap>,
  variant: Variant,
  schema: VariantMap[Variant],
): EnumVariant<Variant, VariantMap[Variant]> {
  function from(
    input: StandardSchemaV1.InferOutput<VariantMap[Variant]>,
  ): EnumValue<Variant, VariantMap[Variant]> {
    return {
      [keys.id]: enumStatic[keys.id],
      [keys.variant]: variant,
      values: input,
    };
  }

  return Object.assign(
    function parse(
      ...input: StandardSchemaV1.InferInput<VariantMap[Variant]>
    ): EnumValue<Variant, VariantMap[Variant]> {
      return from(parseSync(schema, input));
    },
    {
      matches: (value: UnknownEnumValue) =>
        matchesVariant(enumStatic, variant, value),
      from: (...args: StandardSchemaV1.InferOutput<VariantMap[Variant]>) =>
        from(args),
    },
  );
}

export function construct<const VariantMap extends UnknownVariantMap>(
  variants: VariantMap,
): Enum<VariantMap> {
  const enumStatic: EnumStatic<VariantMap> = {
    [keys.id]: nanoid(),
    matches: (value) => matchesEnum(enumStatic, value),
  };

  const target = enumStatic as Enum<VariantMap>;

  for (const variant in variants) {
    target[variant] = makeEnumVariant(
      enumStatic,
      variant,
      variants[variant],
    ) as never;
  }

  return target;
}

export function match<
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap & string,
  MatcherValues extends Record<Variant, unknown>,
>(
  en: Enum<VariantMap>,
  value: EnumValue<Variant, VariantMap[Variant]>,
  matchers: VariantMatchers<VariantMap, Variant, MatcherValues>,
): MatcherValues[Variant] {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  assert(value?.[keys.id] && value[keys.variant], "Must be an enum value");
  assert(en[keys.id] === value[keys.id], "Enum mismatch");

  const variant = value[keys.variant];
  assert(en[variant], "No variant " + String(variant));

  const matcher = matchers[variant];
  assert(matcher, "No matcher for variant " + String(variant));

  return matcher(...value.values);
}
