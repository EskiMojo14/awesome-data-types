import type { StandardSchemaV1 } from "@standard-schema/spec";
import { SchemaError } from "@standard-schema/utils";
import * as v from "valibot";
import { describe, expect, it } from "vitest";
import * as keys from "./keys";
import type { StandardSchemaV1Dictionary } from "./standard";
import { identity, transform } from "./standard";
import type {
  UnknownVariantMap,
  ADT,
  ADTValueFor,
  ADTVariant,
  UnknownArraySchema,
} from "./types";
import { objectEntries, objectKeys } from "./utils";
import { construct, match, matches } from "./index";

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
function makeADTValue<VariantMap extends UnknownVariantMap>(
  adt: ADT<VariantMap>,
  variant: keyof VariantMap,
  args: StandardSchemaV1.InferInput<VariantMap[keyof VariantMap]>,
): ADTValueFor<typeof adt> {
  return adt[variant](...args) as never;
}

describe.each([
  ["without", identityColorVariantSchemas],
  ["with", colorVariantSchemas],
] as const)("construct %s validation", (hasValidation, variantSchemas) => {
  const Color = construct(variantSchemas);
  it("should create an ADT", () => {
    expect(Color[keys.id]).toBeTypeOf("string");
    for (const variant of variants) {
      expect(Color[variant]).toBeTypeOf("function");
      expect(Color[variant]).toEqual(
        expect.objectContaining<
          Omit<ADTVariant<string, UnknownArraySchema, UnknownVariantMap>, never>
        >({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          from: expect.typeOf("function"),
          [keys.id]: Color[keys.id],
          [keys.type]: "variant",
          [keys.variant]: variant,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          schema: expect.exactly(variantSchemas[variant]),
        }),
      );
    }
  });
  it.each(cases)("should create a value for %s", (variant, args) => {
    const value = makeADTValue(Color, variant, args);
    expect(value).toEqual<ADTValueFor<typeof Color>>({
      [keys.id]: Color[keys.id],
      [keys.type]: "value",
      [keys.variant]: variant,
      values: variantOutputs[variant],
    });
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
      const value = Color[variant].from(...(args as unknown as Array<never>));
      expect(value).toEqual<ADTValueFor<typeof Color>>({
        [keys.id]: Color[keys.id],
        [keys.type]: "value",
        [keys.variant]: variant,
        values: args,
      });
    },
  );
});

describe("matches", () => {
  const Color = construct(colorVariantSchemas);
  it("should match", () => {
    for (const [variant, args] of cases) {
      const value = makeADTValue(Color, variant, args);
      expect(matches(Color, value)).toBe(true);
    }
  });
});

describe("match", () => {
  const Color = construct(colorVariantSchemas);
  const red = Color.Rgb(255, 0, 0);
  it("should match", () => {
    expect(
      match(red, {
        Rgb: (...args) => `rgb(${args.join(", ")})`,
      }),
    ).toBe("rgb(255, 0, 0)");
  });
  it("should throw if missing case", () => {
    expect(() => match(red, {} as never)).toThrowError("missing case for Rgb");
  });
});
