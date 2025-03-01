# awesome-data-types

A library for creating ADT enums in TypeScript, powered by runtime validation.

Supports any [Standard Schema](https://standardschema.dev/) library.

```ts
import * as v from "valibot";
import { rgbToHex } from "./utils";
import type { ADTValueFor, UnknownADTValue } from "awesome-data-types";
import { construct, matches, identity, transform } from "awesome-data-types";

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

// or for compile time only validation
const Color = construct({
  Rgb: identity<[r: number, g: number, b: number]>(),
  Hex: identity<[hex: string]>(),
  Hsl: identity<[h: number, s: number, l: number]>(),
  // supports transforming inputs
  HexFromRgb: transform(
    (rgb: [r: number, g: number, b: number]): [hex: string] => [rgbToHex(rgb)],
  ),
});

type Color = ADTValueFor<typeof Color>;

const red = Color.Rgb(255, 0, 0);
const green = Color.Hex("#00ff00");
const blue = Color.Hsl(240, 100, 50);
const purple = Color.HexFromRgb(128, 0, 128);

// construct without validation or transformation
const purple2 = Color.HexFromRgb.from("#800080");

function handleUnknownValue(value: UnknownADTValue) {
  // type guard
  if (matches(Color, value)) {
    // value is a Color
    value.values; // [255, 0, 0]
  }
  if (matches(Color.Rgb, value)) {
    // color is a Color.Rgb
    color.values; // [255, 0, 0]
  }
}

function handleColor(color: Color) {
  // can manually narrow
  if (color.variant === "Rgb") {
    // color is a Color.Rgb
    color.values; // [255, 0, 0]
  }
  // pattern matching
  const colorString = match(color, {
    Rgb: (r, g, b) => `rgb(${r}, ${g}, ${b})`,
    Hex: (hex) => hex,
    Hsl: (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`,
    HexFromRgb: (hex) => hex,
  });
}
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
// construct a discriminated union of values
type Color = ADTValueFor<typeof Color>;
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
const Color = construct({
  RgbWithoutLabel: rgbSchema,
  RgbWithLabel: labelArgs<[r: number, g: number, b: number]>()(rgbSchema),
});
type Color = ADTValueFor<typeof Color>;

function handleColor(color: Color) {
  match(color, {
    RgbWithoutLabel(r) {
      // r, g, b are numbers
    },
    RgbWithLabel(r) {
      // r, g, b are numbers
    },
  });
}
```
![image](https://github.com/user-attachments/assets/d5e04363-7671-4b90-b9a9-420c20194df2)
![image](https://github.com/user-attachments/assets/b6c4b0b2-6572-4c4d-8e09-e6ae5b4af502)

Note that the type will be widened to a standard schema with a single call - if you want to preserve the base schema type, you can use the curried form.

```ts
const baseSchema = v.tuple([v.number(), v.number(), v.number()]);

const schema = labelArgs<[r: number, g: number, b: number]>(baseSchema);
schema.items; // error - we've lost the base schema type

const schema2 = labelArgs<[r: number, g: number, b: number]>()(baseSchema);
schema2.items; // ok - we've preserved the base schema type
```
