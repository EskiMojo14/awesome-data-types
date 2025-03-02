import * as v from "valibot";
import { describe, expectTypeOf, it } from "vitest";
import { identity, transform } from "./standard";
import type { AdtValueFor, UnknownAdtValue, ValueOf, InputFor } from "./types";
import { construct, matches, match } from "./index";

declare function rgbToHex(rgb: [number, number, number]): string;

const Color = construct("Color", {
  Rgb: identity<[r: number, g: number, b: number]>(),
  Hex: identity<[hex: string]>(),
  Hsl: identity<[h: number, s: number, l: number]>(),
  HexFromRgb: transform(
    (rgb: [r: number, g: number, b: number]): [hex: string] => [rgbToHex(rgb)],
  ),
});
type Color = AdtValueFor<typeof Color>;

const Option = construct("Option", {
  Some: identity<[value: number]>(),
  None: identity<[]>(),
});
type Option = AdtValueFor<typeof Option>;

it("provides utils", () => {
  expectTypeOf<ValueOf<typeof Color.HexFromRgb>>().toEqualTypeOf<
    [hex: string]
  >();
  expectTypeOf<InputFor<typeof Color.HexFromRgb>>().toEqualTypeOf<
    [r: number, g: number, b: number]
  >();
});

declare const unknownValue: UnknownAdtValue;
declare const colorValue: Color;
declare const multiValue: Color | Option;

describe("construct", () => {
  it("preserves schema type accurately", () => {
    const someSchema = v.tuple([v.number()]);
    const noneSchema = v.tuple([]);
    const Option = construct("Option", {
      Some: someSchema,
      None: noneSchema,
    });
    expectTypeOf(Option.Some.schema).toEqualTypeOf<typeof someSchema>();
    expectTypeOf(Option.None.schema).toEqualTypeOf<typeof noneSchema>();
  });
});

describe("matches", () => {
  it("should act as type guard", () => {
    if (matches(Color, unknownValue)) {
      expectTypeOf(unknownValue).toEqualTypeOf<Color>();
      expectTypeOf(unknownValue.values).toEqualTypeOf<
        | [r: number, g: number, b: number]
        | [hex: string]
        | [h: number, s: number, l: number]
      >();
    }
    if (matches(Color.Rgb, unknownValue)) {
      expectTypeOf(unknownValue).toEqualTypeOf<ReturnType<typeof Color.Rgb>>();
      expectTypeOf(unknownValue.values).toEqualTypeOf<
        [r: number, g: number, b: number]
      >();
    }
    if (matches(Color.HexFromRgb, unknownValue)) {
      expectTypeOf(unknownValue).toEqualTypeOf<
        ReturnType<typeof Color.HexFromRgb>
      >();
      expectTypeOf(unknownValue.values).toEqualTypeOf<[hex: string]>();
    }
  });
});

describe("match", () => {
  it("should only require possible cases", () => {
    // @ts-expect-error missing case
    match(colorValue, {
      Rgb(...args) {
        expectTypeOf(args).toEqualTypeOf<[r: number, g: number, b: number]>();
      },
      Hex(...args) {
        expectTypeOf(args).toEqualTypeOf<[hex: string]>();
      },
      Hsl(...args) {
        expectTypeOf(args).toEqualTypeOf<[h: number, s: number, l: number]>();
      },
    });
    match(multiValue, {
      Option: {
        Some(...args) {
          expectTypeOf(args).toEqualTypeOf<[value: number]>();
        },
        None(...args) {
          expectTypeOf(args).toEqualTypeOf<[]>();
        },
      },
      Color: {
        Rgb(...args) {
          expectTypeOf(args).toEqualTypeOf<[r: number, g: number, b: number]>();
        },
        Hex(...args) {
          expectTypeOf(args).toEqualTypeOf<[hex: string]>();
        },
        Hsl(...args) {
          expectTypeOf(args).toEqualTypeOf<[h: number, s: number, l: number]>();
        },
        HexFromRgb(...args) {
          expectTypeOf(args).toEqualTypeOf<[hex: string]>();
        },
      },
    });
  });
  it("should return the correct type", () => {
    const result = match(colorValue, {
      Rgb() {
        return "rgb" as const;
      },
      Hex() {
        return "hex" as const;
      },
      Hsl() {
        return "hsl" as const;
      },
      HexFromRgb() {
        return "hex from rgb" as const;
      },
    });
    expectTypeOf(result).toEqualTypeOf<
      "rgb" | "hex" | "hsl" | "hex from rgb"
    >();

    const result2 = match(multiValue, {
      Option: {
        Some() {
          return "some" as const;
        },
        None() {
          return "none" as const;
        },
      },
      Color: {
        Rgb() {
          return "rgb" as const;
        },
        Hex() {
          return "hex" as const;
        },
        Hsl() {
          return "hsl" as const;
        },
        HexFromRgb() {
          return "hex from rgb" as const;
        },
      },
    });
    expectTypeOf(result2).toEqualTypeOf<
      "some" | "none" | "rgb" | "hex" | "hsl" | "hex from rgb"
    >();
  });
});
