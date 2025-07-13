import { describe, expect, it } from "vitest";
import { identity, labelArgs, transform } from "./standard";

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
