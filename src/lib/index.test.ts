import type { StandardSchemaV1 } from "@standard-schema/spec";
import { SchemaError } from "@standard-schema/utils";
import * as v from "valibot";
import { describe, expect, it, vi } from "vitest";
import * as keys from "./keys";
import type { StandardSchemaV1Dictionary } from "./standard";
import { identity, transform } from "./standard";
import type { UnknownVariantMap, Enum, EnumValueFor } from "./types";
import { objectEntries, objectKeys } from "./utils";
import { construct, match } from "./index";

function rgbToHex([r, g, b]: [number, number, number]) {
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}

const identityColorVariantSchemas = {
  Rgb: identity<[r: number, g: number, b: number]>(),
  RgbToHex: transform(
    (rgb: [r: number, g: number, b: number]): [hex: string] => [rgbToHex(rgb)],
  ),
  Hex: identity<[hex: string]>(),
  Hsl: identity<[h: number, s: number, l: number]>(),
};

const colorVariantSchemas: typeof identityColorVariantSchemas = {
  Rgb: v.tuple([v.number(), v.number(), v.number()]),
  RgbToHex: v.pipe(
    v.tuple([v.number(), v.number(), v.number()]),
    v.transform((rgb) => [rgbToHex(rgb)]),
    v.tuple([v.string()]),
  ),
  Hex: v.tuple([v.string()]),
  Hsl: v.tuple([v.number(), v.number(), v.number()]),
};

const variantInputs: StandardSchemaV1Dictionary.InferInput<
  typeof identityColorVariantSchemas
> = {
  Rgb: [0, 0, 0],
  RgbToHex: [0, 0, 0],
  Hex: ["#000"],
  Hsl: [0, 0, 0],
};

const variantOutputs: StandardSchemaV1Dictionary.InferOutput<
  typeof identityColorVariantSchemas
> = {
  Rgb: variantInputs.Rgb,
  RgbToHex: ["#000"],
  Hex: variantInputs.Hex,
  Hsl: variantInputs.Hsl,
};

const cases = objectEntries(variantInputs);
const variants = objectKeys(variantInputs);

// wrapper to avoid typescript complaints
function makeEnumValue<VariantMap extends UnknownVariantMap>(
  en: Enum<VariantMap>,
  variant: keyof VariantMap,
  args: StandardSchemaV1.InferInput<VariantMap[keyof VariantMap]>,
): EnumValueFor<typeof en> {
  return en[variant](...args) as never;
}

describe.each([
  ["with", colorVariantSchemas],
  ["without", identityColorVariantSchemas],
] as const)("construct %s validation", (hasValidation, variantSchemas) => {
  const Color = construct(variantSchemas);
  it("should create an enum", () => {
    expect(Color[keys.id]).toBeTypeOf("string");
    for (const variant of variants) {
      expect(Color[variant]).toBeTypeOf("function");
    }
  });
  it.each(cases)("should create a value for %s", (variant, args) => {
    const value = makeEnumValue(Color, variant, args);
    expect(value[keys.id]).toBe(Color[keys.id]);
    expect(value[keys.variant]).toBe(variant);
    expect(value.values).toEqual(variantOutputs[variant]);
  });
  if (hasValidation === "with") {
    it("should throw if invalid", () => {
      // @ts-expect-error testing invalid input
      expect(() => Color.Hex(0, 0, 256)).toThrowError(SchemaError);
    });
  }
  it.each(objectEntries(variantOutputs))(
    "should create a value from %s",
    (variant, args) => {
      const value = Color[variant].from(...(args as unknown as never[]));
      expect(value[keys.id]).toBe(Color[keys.id]);
      expect(value[keys.variant]).toBe(variant);
      expect(value.values).toEqual(args);
    },
  );
  it.each(cases)("should match a value for %s", (variant, args) => {
    const value = makeEnumValue(Color, variant, args);
    expect(Color.matches(value)).toBe(true);
    for (const v of variants) {
      expect(Color[v].matches(value)).toBe(v === variant);
    }
  });
});

describe("match", () => {
  const Color = construct(colorVariantSchemas);
  const notMatched = vi.fn(() => "not matched");
  const matchers = {
    Rgb: notMatched,
    RgbToHex: notMatched,
    Hex: notMatched,
    Hsl: notMatched,
  };
  const matched = vi.fn(() => "matched");
  it.each(cases)("should match a value for %s", (variant, args) => {
    const value = makeEnumValue(Color, variant, args);
    for (const v of variants) {
      notMatched.mockClear();
      matched.mockClear();
      const isMatch = v === variant;
      expect(match(Color, value, { ...matchers, [v]: matched })).toBe(
        isMatch ? "matched" : "not matched",
      );
      if (isMatch) {
        expect(matched).toHaveBeenCalledWith(...variantOutputs[variant]);
        expect(notMatched).not.toHaveBeenCalled();
      } else {
        expect(matched).not.toHaveBeenCalled();
        expect(notMatched).toHaveBeenCalledWith(...variantOutputs[variant]);
      }
    }
  });
  describe("should throw if", () => {
    it("the value is not an enum value", () => {
      expect(() => match(Color, {} as never, matchers)).toThrowError(
        "Must be an enum value",
      );
    });
    it("the enum id does not match", () => {
      expect(() =>
        match(
          Color,
          { [keys.id]: "other", [keys.variant]: "Rgb" } as never,
          matchers,
        ),
      ).toThrowError("Enum mismatch");
    });
    it("the variant does not exist", () => {
      expect(() =>
        match(
          Color,
          { [keys.id]: Color[keys.id], [keys.variant]: "other" } as never,
          matchers,
        ),
      ).toThrowError("No variant other");
    });
    it("the matcher does not exist", () => {
      expect(() => match(Color, Color.Rgb(0, 0, 0), {} as never)).toThrowError(
        "No matcher for variant Rgb",
      );
    });
  });
});
