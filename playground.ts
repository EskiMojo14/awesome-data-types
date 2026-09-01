import * as v from "valibot";
import * as ADT from "awesome-data-types";
import * as ADTS from "awesome-data-types/schema";

function rgbToHex([r, g, b]: [number, number, number]) {
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}

// for runtime validation
const Color = ADT.construct("Color", {
  Rgb: ADTS.labelArgs<[r: number, g: number, b: number]>()(
    v.tuple([v.number(), v.number(), v.number()]),
  ),
  Hex: ADTS.labelArgs<[hex: string]>()(v.tuple([v.string()])),
  Hsl: ADTS.labelArgs<[h: number, s: number, l: number]>()(
    v.tuple([v.number(), v.number(), v.number()]),
  ),
  // supports transforming inputs
  HexFromRgb: ADTS.labelArgs<[r: number, g: number, b: number], [hex: string]>()(
    v.pipe(
      v.tuple([v.number(), v.number(), v.number()]),
      v.transform((rgb) => [rgbToHex(rgb)]),
      v.tuple([v.string()]),
    ),
  ),
});

// or for compile time only validation
const ColorSimple = ADT.construct("Color", {
  Rgb: ADTS.identity<[r: number, g: number, b: number]>(),
  Hex: ADTS.identity<[hex: string]>(),
  Hsl: ADTS.identity<[h: number, s: number, l: number]>(),
  // supports transforming inputs
  HexFromRgb: ADTS.transform((rgb: [r: number, g: number, b: number]): [hex: string] => [
    rgbToHex(rgb),
  ]),
});

type Color = ADT.AdtValueFor<typeof Color>;

const red = Color.Rgb(255, 0, 0);
const green = Color.Hex("#00ff00");
const blue = Color.Hsl(240, 100, 50);
const purple = Color.HexFromRgb(128, 0, 128);

// construct without validation or transformation
const purple2 = Color.HexFromRgb.from("#800080");

function handleUnknownValue(value: ADT.UnknownAdtValue) {
  // type guard
  if (ADT.matches(Color, value)) {
    // value is a Color
    value.values; // narrowed to [r: number, g: number, b: number] | [hex: string] | [h: number, s: number, l: number]
  }
  if (ADT.matches(Color.Rgb, value)) {
    // color is a Color.Rgb
    value.values; // narrowed to [r: number, g: number, b: number]
  }
}

function handleColor(color: Color) {
  // can manually narrow
  if (color.variant === "Rgb") {
    // color is a Color.Rgb
    color.values; // narrowed to [r: number, g: number, b: number]
  }
  // pattern matching
  const colorString = ADT.match(color, {
    Rgb: (r, g, b) => `rgb(${r}, ${g}, ${b})`,
    Hex: (hex) => hex,
    Hsl: (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`,
    HexFromRgb: (hex) => hex,
  });
}
