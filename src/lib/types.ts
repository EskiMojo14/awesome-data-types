import type { StandardSchemaV1 } from "@standard-schema/spec";
import type * as keys from "./keys";
import type { StandardSchemaV1Dictionary } from "./standard";

export interface EnumValue<
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap,
> {
  [keys.id]: string;
  [keys.variant]: Variant;
  values: StandardSchemaV1.InferOutput<VariantMap[Variant]>;
}

export type UnknownVariantMap = StandardSchemaV1Dictionary<
  Record<string, ReadonlyArray<unknown>>
> &
  Partial<Record<keyof EnumStatic<any>, never>>;

export type UnknownEnumValue = EnumValue<UnknownVariantMap, string>;

export interface EnumVariant<
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap & string,
> {
  (
    ...values: StandardSchemaV1.InferInput<VariantMap[Variant]>
  ): EnumValue<VariantMap, Variant>;

  matches(value: UnknownEnumValue): value is EnumValue<VariantMap, Variant>;
}

export type EnumVariants<VariantMap extends UnknownVariantMap> = {
  [Variant in keyof VariantMap & string]: EnumVariant<VariantMap, Variant>;
};

export interface EnumStatic<VariantMap extends UnknownVariantMap> {
  [keys.id]: string;
  matches(
    value: UnknownEnumValue,
  ): value is EnumValue<VariantMap, keyof VariantMap & string>;
}

export type Enum<VariantMap extends UnknownVariantMap> =
  EnumVariants<VariantMap> & EnumStatic<VariantMap>;

export type EnumVariantMap<E extends Enum<UnknownVariantMap>> =
  E extends Enum<infer VariantMap> ? VariantMap : never;

export type EnumValueFor<E extends Enum<UnknownVariantMap>> = EnumValue<
  EnumVariantMap<E>,
  keyof EnumVariantMap<E>
>;

export type VariantMatchers<
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap & string,
  MatcherValues extends Record<Variant, unknown>,
> = {
  [V in Variant]: V extends Variant
    ? (
        ...values: StandardSchemaV1.InferOutput<VariantMap[V]>
      ) => MatcherValues[V]
    : never;
};
