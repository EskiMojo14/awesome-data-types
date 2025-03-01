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
} from "./types";
import { assert } from "./utils";

function matchesEnum<VariantMap extends UnknownVariantMap>(
  en: EnumStatic<VariantMap>,
  value: UnknownEnumValue,
): value is EnumValue<VariantMap, keyof VariantMap & string> {
  return value[keys.id] === en[keys.id];
}

function matchesVariant<
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap & string,
>(
  en: EnumStatic<VariantMap>,
  variant: Variant,
  value: UnknownEnumValue,
): value is EnumValue<VariantMap, Variant> {
  return value[keys.id] === en[keys.id] && value[keys.variant] === variant;
}

function makeEnumVariant<
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap & string,
>(
  enumStatic: EnumStatic<VariantMap>,
  variant: Variant,
  schema: VariantMap[Variant],
): EnumVariant<VariantMap, Variant> {
  function construct(
    ...input: StandardSchemaV1.InferInput<VariantMap[Variant]>
  ): EnumValue<VariantMap, Variant> {
    const result = parseSync(schema, input);
    return {
      [keys.id]: enumStatic[keys.id],
      [keys.variant]: variant,
      values: result,
    };
  }

  return Object.assign(construct, {
    matches: (value: UnknownEnumValue) =>
      matchesVariant(enumStatic, variant, value),
  });
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
  value: EnumValue<NoInfer<VariantMap>, Variant>,
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
