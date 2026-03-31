import type { StandardSchemaV1 } from "@standard-schema/spec";
import type * as keys from "./keys";
import type { AnyFn } from "./utils";

/**
 * An ADT value.
 */
export interface AdtValue<
  Name extends string,
  Variant extends PropertyKey,
  VariantSchema extends UnknownArraySchema,
> {
  /** The variant's values */
  readonly values: StandardSchemaV1.InferOutput<VariantSchema>;
  /** The variant's name */
  readonly variant: Variant;
  // dissuade
  readonly [keys.name]: Name;
  readonly [keys.type]: "value";
}

export type UnknownArraySchema = StandardSchemaV1<ReadonlyArray<unknown>>;

export type UnknownVariantMap = Record<PropertyKey, UnknownArraySchema> &
  Partial<Record<keyof AdtStatic<any, any>, never>>;

export type UnknownAdtValue = AdtValue<string, PropertyKey, UnknownArraySchema>;

/**
 * The base for an ADT variant.
 */
export interface AdtVariantBase<
  Name extends string,
  Variant extends PropertyKey,
  VariantSchema extends UnknownArraySchema,
> {
  /** Construct an ADT value from already-parsed values */
  from(
    ...values: StandardSchemaV1.InferOutput<VariantSchema>
  ): AdtValue<Name, Variant, VariantSchema>;

  /** The variant's schema */
  readonly schema: VariantSchema;

  // dissuade
  readonly [keys.variant]: Variant;
  readonly [keys.name]: Name;
  readonly [keys.type]: "variant";
}

/**
 * A synchronous ADT variant.
 */
export interface AdtVariant<
  Name extends string,
  Variant extends PropertyKey,
  VariantSchema extends UnknownArraySchema,
> extends AdtVariantBase<Name, Variant, VariantSchema> {
  /** Construct an ADT value from input values, including validation */
  (...values: StandardSchemaV1.InferInput<VariantSchema>): AdtValue<Name, Variant, VariantSchema>;
}

/**
 * An asynchronous ADT variant.
 */
export interface AdtVariantAsync<
  Name extends string,
  Variant extends PropertyKey,
  VariantSchema extends UnknownArraySchema,
> extends AdtVariantBase<Name, Variant, VariantSchema> {
  /** Construct an ADT value from input values, including validation */
  (
    ...values: StandardSchemaV1.InferInput<VariantSchema>
  ): Promise<AdtValue<Name, Variant, VariantSchema>>;
}

export type AdtVariants<Name extends string, VariantMap extends UnknownVariantMap> = {
  [Variant in keyof VariantMap]: AdtVariant<Name, Variant, VariantMap[Variant]>;
};

export type AdtVariantsAsync<Name extends string, VariantMap extends UnknownVariantMap> = {
  [Variant in keyof VariantMap]: AdtVariantAsync<Name, Variant, VariantMap[Variant]>;
};

export interface AdtStatic<Name extends string, VariantMap extends UnknownVariantMap> {
  // dissuade
  readonly [keys.name]: Name;
  readonly [keys.type]: "ADT";
  readonly [keys.variants]: VariantMap;
}

export type Adt<Name extends string, VariantMap extends UnknownVariantMap> = AdtVariants<
  Name,
  VariantMap
> &
  AdtStatic<Name, VariantMap>;

export type AdtAsync<Name extends string, VariantMap extends UnknownVariantMap> = AdtVariantsAsync<
  Name,
  VariantMap
> &
  AdtStatic<Name, VariantMap>;

export type AdtVariantMap<E extends Adt<any, any> | AdtAsync<any, any>> = E[typeof keys.variants];

export type AdtValueFor<E extends Adt<any, any> | AdtAsync<any, any>> = {
  [Variant in keyof AdtVariantMap<E>]: AdtValue<
    E[typeof keys.name],
    Variant,
    AdtVariantMap<E>[Variant]
  >;
}[keyof AdtVariantMap<E>];

export type ValueOf<T extends { schema: UnknownArraySchema }> = StandardSchemaV1.InferOutput<
  T["schema"]
>;
export type InputFor<T extends { schema: UnknownArraySchema }> = StandardSchemaV1.InferInput<
  T["schema"]
>;

export type VariantCases = Partial<Record<PropertyKey, AnyFn>>;

export type MatcherMap<Value extends UnknownAdtValue> = {
  [Variant in Value as Variant["variant"]]?: (...args: Variant["values"]) => unknown;
};

export type MatchedValues<Matchers extends VariantCases> = {
  variant: keyof Matchers;
};

export type UnmatchedValues<Value extends UnknownAdtValue, Matchers extends VariantCases> = Exclude<
  Value,
  MatchedValues<Matchers>
>;

export type MatcherResults<
  Value extends UnknownAdtValue,
  Matchers extends MatcherMap<Value>,
> = ReturnType<NonNullable<(Matchers & VariantCases)[Value["variant"]]>>;
