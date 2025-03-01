import { describe, expect, it } from "vitest";
import * as keys from "./keys";
import { construct, match } from "./index";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type ColorVariants = {
  Rgb: [r: number, g: number, b: number];
  Hex: [hex: string];
  Hsl: [h: number, s: number, l: number];
};
const Color = construct<ColorVariants>();
const variantArgs: ColorVariants = {
  Rgb: [0, 0, 0],
  Hex: ["#000"],
  Hsl: [0, 0, 0],
};
const cases = Object.entries(variantArgs) as ReadonlyArray<
  [keyof ColorVariants, ColorVariants[keyof ColorVariants]]
>;
const variants = Object.keys(variantArgs) as ReadonlyArray<keyof ColorVariants>;

describe("construct", () => {
  it("should create an enum using a proxy", () => {
    for (const variant of variants) {
      expect(Color[variant]).toBeTypeOf("function");
    }

    // @ts-expect-error testing invalid key
    expect(Color.foo).toBeTypeOf("function");

    expect(Color[keys.id]).toBeTypeOf("string");
  });
  it("can pre-construct variants, without a proxy", () => {
    const Color = construct<ColorVariants>({
      Rgb: true,
      Hex: true,
      Hsl: true,
    });

    for (const variant of variants) {
      expect(Color[variant]).toBeTypeOf("function");
    }

    // @ts-expect-error testing invalid key
    expect(Color.foo).toBeUndefined();

    expect(Color[keys.id]).toBeTypeOf("string");
  });
  it("should cache enum variants", () => {
    expect(Color.Rgb).toBe(Color.Rgb);
  });
  it.each(cases)("should create enum value: %s", (variant, values) => {
    // @ts-expect-error contravariance
    expect(Color[variant](...values)).toMatchObject({
      [keys.id]: Color[keys.id],
      [keys.variant]: variant,
      values,
    });
  });
  it.each(cases)("should match enum value: %s", (variant, values) => {
    // @ts-expect-error contravariance
    const value = Color[variant](...values);
    expect(Color[variant].matches(value)).toBe(true);
  });
  it.each(cases)("should not match other enum value: %s", (variant, values) => {
    // @ts-expect-error contravariance
    const value = Color[variant](...values);
    for (const otherVariant of variants) {
      if (otherVariant === variant) continue;
      expect(Color[otherVariant].matches(value)).toBe(false);
    }
  });
  it.each(cases)("should derive enum value: %s", (variant, values) => {
    // @ts-expect-error contravariance
    const value = Color[variant](...values);
    expect(Color[variant].derive(value, () => "derived")).toBe("derived");
  });
  it.each(cases)(
    "should not derive other enum value: %s",
    (variant, values) => {
      // @ts-expect-error contravariance
      const value = Color[variant](...values);
      for (const otherVariant of variants) {
        if (otherVariant === variant) continue;
        expect(
          Color[otherVariant].derive(value, () => "derived"),
        ).toBeUndefined();
      }
    },
  );
});

describe("match", () => {
  it.each(cases)("should match enum value: %s", (variant, values) => {
    // @ts-expect-error contravariance
    const value = Color[variant](...values);
    // @ts-expect-error this is messy
    expect(match(Color, value, { [variant]: () => "matched" })).toBe("matched");
  });
  it.each(cases)("should not match other enum value: %s", (variant, values) => {
    // @ts-expect-error contravariance
    const value = Color[variant](...values);
    for (const otherVariant of variants) {
      if (otherVariant === variant) continue;
      expect(() =>
        // @ts-expect-error this is messy
        match(Color, value, { [otherVariant]: () => "matched" }),
      ).toThrow();
    }
  });
});
