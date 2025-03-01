import { nanoid } from "nanoid/non-secure";
import * as keys from "./keys";
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
>(enumId: string, variant: Variant): EnumVariant<VariantMap, Variant> {
  function construct(...values: VariantMap[Variant]) {
    return {
      [keys.id]: enumId,
      [keys.variant]: variant,
      values,
    };
  }

  function matches(
    value: UnknownEnumValue,
  ): value is EnumValue<VariantMap, Variant> {
    return value[keys.id] === enumId && value[keys.variant] === variant;
  }

  function derive<Derived>(
    value: UnknownEnumValue,
    derive: (...values: VariantMap[Variant]) => Derived,
  ) {
    if (matches(value)) {
      return derive(...(value.values as never));
    }
  }

  return Object.assign(construct, {
    matches,
    derive,
  });
}

export function construct<VariantMap extends UnknownVariantMap>(
  variants?: Record<keyof VariantMap, true>,
): Enum<VariantMap> {
  const enumId = nanoid();

  const target = {} as Enum<VariantMap>;
  target[keys.id] = enumId;

  // if we have runtime variants, we can pre-construct them
  if (variants) {
    for (const variant in variants) {
      Reflect.set(target, variant, makeEnumVariant(enumId, variant));
    }
    return target;
  }

  // otherwise, we can use a proxy to construct them on demand
  return new Proxy(target, {
    get(cache, variant) {
      if (variant === keys.id) return enumId;
      if (typeof variant !== "string") return;
      const cached = cache[variant];
      if (cached) return cached;
      const variantFn = makeEnumVariant(enumId, variant);
      Reflect.set(cache, variant, variantFn);
      return variantFn;
    },
  });
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
      ? (...values: VariantMap[V & Variant]) => MatcherValues[V]
      : never;
  },
): MatcherValues[Variant] {
  const variant = value[keys.variant];
  assert(variant, "Must be an enum value");
  assert(en[variant].matches(value), "Variant mismatch");
  const matcher = matchers[variant];
  assert(matcher, "No matcher for variant " + String(variant));
  return matcher(...(value.values as never));
}
