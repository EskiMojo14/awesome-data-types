# awesome-data-types

A library for creating ADT enums in TypeScript. Uses Standard Schemas for runtime validation.

```ts
import * as v from "valibot";
import { rgbToHex } from "./utils";
import { construct, matches, identity, transform } from "awesome-data-types";

// for compile time only validation
const Color = construct({
  Rgb: identity<[r: number, g: number, b: number]>(),
  Hex: identity<[hex: string]>(),
  Hsl: identity<[h: number, s: number, l: number]>(),
  // supports transforming inputs
  HexFromRgb: transform(
    (rgb: [r: number, g: number, b: number]): [hex: string] => [rgbToHex(rgb)],
  ),
});

// for runtime validation
const Color = construct({
  Rgb: v.tuple([v.number(), v.number(), v.number()]),
  Hex: v.tuple([v.string()]),
  Hsl: v.tuple([v.number(), v.number(), v.number()]),
  // supports transforming inputs
  HexFromRgb: v.pipe(
    v.tuple([v.number(), v.number(), v.number()]),
    v.transform((rgb) => [rgbToHex(rgb)]),
    v.tuple([v.string()]),
  ),
});

const red = Color.Rgb(255, 0, 0);
const green = Color.Hex("#00ff00");
const blue = Color.Hsl(240, 100, 50);
const purple = Color.HexFromRgb(128, 0, 128);

// construct without validation or transformation
const purple2 = Color.HexFromRgb.from("#800080");

// basic matching
if (matches(Color, red)) {
  // red is a Color
  color.values; // [255, 0, 0]
}
if (matches(Color.Rgb, red)) {
  // red is a Color.Rgb
  color.values; // [255, 0, 0]
}

// pattern matching
const colorString = match(red, {
  Rgb: (r, g, b) => `rgb(${r}, ${g}, ${b})`,
  Hex: (hex) => hex,
  Hsl: (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`,
});
```
