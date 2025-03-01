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

## API

### `construct`

Creates an ADT from a map of variant schemas. Note that each variant must be an array schema.

```ts
const Color = construct({
  Rgb: identity<[r: number, g: number, b: number]>(),
  Hex: identity<[hex: string]>(),
  Hsl: identity<[h: number, s: number, l: number]>(),
});
```

Each variant is a function that takes the variant's arguments and returns an ADT value, storing the parsed arguments.

```ts
const red = Color.Rgb(255, 0, 0);
console.log(red.values); // [255, 0, 0]

// transformation happens here
const blue = Color.RgbToHex(0, 0, 255);
console.log(blue.values); // ["#0000ff"]
```

Each variant also has an attached `from` method that skips parsing.

```ts
const red = Color.Rgb.from(255, 0, 0);
console.log(red.values); // [255, 0, 0]

// expects already parsed values
const blue = Color.RgbToHex.from("#0000ff");
console.log(blue.values); // ["#0000ff"]
```

Schemas are attached to each variant.

```ts
Color.Rgb.schema["~standard"].validate([1, 2, 3]); // { value: [1, 2, 3] }
```

### `matches`

Checks if a value is an ADT value.

```ts
if (matches(Color, red)) {
  // red is a Color
  color.values; // [255, 0, 0]
}
if (matches(Color.Rgb, red)) {
  // red is a Color.Rgb
  color.values; // [255, 0, 0]
}
```

### `match`

Matches an ADT value to a pattern, returning the result of the matching case.

Throws an error if the value does not match any case.

```ts
const colorString = match(red, {
  Rgb: (r, g, b) => `rgb(${r}, ${g}, ${b})`,
  Hex: (hex) => hex,
  Hsl: (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`,
});
```

## Schema helpers

### `identity`

Creates a schema that returns the input value, with no validation.

```ts
const schema = identity<[r: number, g: number, b: number]>();
schema["~standard"].validate([1, 2, 3]); // { value: [1, 2, 3] }
```

### `transform`

Creates a schema that transforms the value, with no validation.

```ts
const schema = transform((x: number) => x + 1);
schema["~standard"].validate(1); // { value: 2 }
```

### `labelArgs`

Take a tuple schema and add labels to the items. Useful when using a schema library, since by default tuple items will just be labeled `arg_n`.

```ts
import * as v from "valibot";
import { rgbToHex } from "./utils";
import { labelArgs, construct } from "awesome-data-types";

const baseSchema = v.tuple([v.number(), v.number(), v.number()]);
const schema = labelArgs<[r: number, g: number, b: number]>(baseSchema);

const transformingSchema<[r: number, g: number, b: number], [hex: string]>(v.pipe(
  baseSchema,
  v.transform((rgb) => rgbToHex(rgb)),
  v.tuple([v.string()]),
));

const Color = construct({
  Rgb: schema,
});

Color.Rgb(1, 2, 3); // args are correctly labeled Rgb(r, g, b)
```
