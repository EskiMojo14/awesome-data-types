import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expect, it } from "vite-plus/test";
import { identity, labelArgs, parseSync, transform } from "./standard";
import { SchemaError } from "@standard-schema/utils";

describe("identity", () => {
  it("should return the same value", () => {
    const schema = identity();
    expect(schema["~standard"].validate(1)).toEqual({ value: 1 });
  });
});

describe("transform", () => {
  it("should transform the value", () => {
    const schema = transform((x: number) => x + 1);
    expect(schema["~standard"].validate(1)).toEqual({ value: 2 });
  });
});

describe("labelArgs", () => {
  it("should return the schema", () => {
    const baseSchema = identity<[1, 2, 3]>();
    expect(labelArgs(baseSchema)).toBe(baseSchema);
    expect(labelArgs()(baseSchema)).toBe(baseSchema);
  });
});

describe("parseSync", () => {
  it("should return the value", () => {
    const schema = identity();
    expect(parseSync(schema, 1)).toBe(1);
  });
  it("should throw if the validation is asynchronous", () => {
    const asyncSchema: StandardSchemaV1 = {
      "~standard": {
        version: 1,
        vendor: "awesome-data-types",
        validate: (value) => Promise.resolve({ value }),
      },
    };
    expect(() => parseSync(asyncSchema, 1)).toThrow(
      new TypeError("validation must be synchronous"),
    );
  });
  it("should throw if the validation fails", () => {
    const failSchema: StandardSchemaV1 = {
      "~standard": {
        version: 1,
        vendor: "awesome-data-types",
        validate: () => ({ issues: [{ message: "error" }] }),
      },
    };
    expect(() => parseSync(failSchema, "1")).toThrow(SchemaError);
  });
});
