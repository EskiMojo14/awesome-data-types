import type { StandardSchemaV1 } from "@standard-schema/spec";
import * as v from "valibot";
import { describe, expectTypeOf, it } from "vitest";
import { identity, labelArgs, parseSync, transform } from "./standard";
import type { Override } from "./utils";

describe("identity", () => {
  it("should return a schema with correct type", () => {
    const schema = identity<number>();
    expectTypeOf(schema).toEqualTypeOf<StandardSchemaV1<number>>();
  });
});

describe("transform", () => {
  it("should return a schema with correct types", () => {
    const schema = transform((x: number) => String(x));
    expectTypeOf(schema).toEqualTypeOf<StandardSchemaV1<number, string>>();
  });
});

describe("labelArgs", () => {
  const baseSchema = v.tuple([v.number(), v.number(), v.number()]);
  it("should return a wrapped schema with correct types", () => {
    const schema = labelArgs<[r: number, g: number, b: number]>(baseSchema);
    expectTypeOf(schema).toEqualTypeOf<
      StandardSchemaV1<[r: number, g: number, b: number]>
    >();
    expectTypeOf(schema).not.toHaveProperty("items");
  });
  it("should return original schema with corrected standard schema", () => {
    const schema = labelArgs<[r: number, g: number, b: number]>()(baseSchema);
    expectTypeOf(schema).toEqualTypeOf<
      Override<
        typeof baseSchema,
        StandardSchemaV1<[r: number, g: number, b: number]>
      >
    >();
    expectTypeOf(schema).toHaveProperty("items");
  });
});

describe("parseSync", () => {
  it("should return the value", () => {
    const schema = identity<number>();
    expectTypeOf(parseSync(schema, 1)).toEqualTypeOf<number>();
  });
});
