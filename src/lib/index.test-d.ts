import * as v from "valibot";
import { describe, expectTypeOf, it } from "vitest";
import { identity, transform } from "./standard";
import type { ADTValueFor, UnknownADTValue } from "./types";
import { construct, matches, match } from "./index";

declare function rgbToHex(rgb: [number, number, number]): string;

const Color = construct({
  Rgb: identity<[r: number, g: number, b: number]>(),
  Hex: identity<[hex: string]>(),
  Hsl: identity<[h: number, s: number, l: number]>(),
  HexFromRgb: transform(
    (rgb: [r: number, g: number, b: number]): [hex: string] => [rgbToHex(rgb)],
  ),
});

declare const unknownValue: UnknownADTValue;
declare const colorValue: ADTValueFor<typeof Color>;

describe("construct", () => {
  it("preserves schema type accurately", () => {
    const someSchema = v.tuple([v.number()]);
    const noneSchema = v.tuple([]);
    const Option = construct({
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
      expectTypeOf(unknownValue).toEqualTypeOf<ADTValueFor<typeof Color>>();
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

    match(Color.Rgb(0, 0, 0), {
      Rgb(...args) {
        expectTypeOf(args).toEqualTypeOf<[r: number, g: number, b: number]>();
      },
      // @ts-expect-error not possible
      Hex() {
        // empty
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
  });
});
