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
} from "./types";
import { assert } from "./utils";

function makeEnumVariant<
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap & string,
>(
  enumId: string,
  variant: Variant,
  schema: VariantMap[Variant],
): EnumVariant<VariantMap, Variant> {
  function construct(
    ...input: StandardSchemaV1.InferInput<VariantMap[Variant]>
  ): EnumValue<VariantMap, Variant> {
    const result = parseSync(schema, input);
    return {
      [keys.id]: enumId,
      [keys.variant]: variant,
      value: result,
    };
  }

  function matches(
    value: UnknownEnumValue,
  ): value is EnumValue<VariantMap, Variant> {
    return value[keys.id] === enumId && value[keys.variant] === variant;
  }

  function extract(value: UnknownEnumValue) {
    if (matches(value)) {
      return value.value;
    }
  }

  function derive<Derived>(
    value: UnknownEnumValue,
    derive: (
      ...values: StandardSchemaV1.InferOutput<VariantMap[Variant]>
    ) => Derived,
  ) {
    const values = extract(value);
    return values && derive(...values);
  }

  return Object.assign(construct, {
    matches,
    extract,
    derive,
  });
}

export function construct<VariantMap extends UnknownVariantMap>(
  variants: VariantMap,
): Enum<VariantMap> {
  const enumId = nanoid();

  const target: Record<string, unknown> = { [keys.id]: enumId };

  for (const variant in variants) {
    target[variant] = makeEnumVariant(enumId, variant, variants[variant]);
  }
  return target as never;
}

export function match<
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap & string,
  MatcherValues extends Record<Variant, unknown>,
>(
  en: Enum<VariantMap>,
  value: EnumValue<NoInfer<VariantMap>, Variant>,
  matchers: {
    [V in keyof MatcherValues]: V extends Variant
      ? (
          ...values: StandardSchemaV1.InferOutput<VariantMap[V]>
        ) => MatcherValues[V]
      : never;
  },
): MatcherValues[Variant] {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  assert(value?.[keys.id] && value[keys.variant], "Must be an enum value");
  assert(en[keys.id] === value[keys.id], "Enum mismatch");
  const variant = value[keys.variant];
  assert(en[variant], "No variant " + String(variant));
  const matcher = matchers[variant];
  assert(matcher, "No matcher for variant " + String(variant));
  return matcher(...value.value);
}
