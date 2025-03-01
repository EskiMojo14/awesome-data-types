import type { StandardSchemaV1 } from "@standard-schema/spec";
import type * as keys from "./keys";
import type { StandardSchemaV1Dictionary } from "./standard";

export interface EnumValue<
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap,
> {
  [keys.id]: string;
  [keys.variant]: Variant;
  value: StandardSchemaV1.InferOutput<VariantMap[Variant]>;
}

export type UnknownVariantMap = StandardSchemaV1Dictionary<
  Record<string, ReadonlyArray<unknown>>
>;

export type UnknownEnumValue = EnumValue<UnknownVariantMap, string>;

export interface EnumVariant<
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap & string,
> {
  (
    ...values: StandardSchemaV1.InferInput<VariantMap[Variant]>
  ): EnumValue<VariantMap, Variant>;
  matches(value: UnknownEnumValue): value is EnumValue<VariantMap, Variant>;
  extract(
    value: UnknownEnumValue,
  ): StandardSchemaV1.InferOutput<VariantMap[Variant]> | undefined;
  derive<Derived>(
    value: UnknownEnumValue,
    derive: (
      ...values: StandardSchemaV1.InferOutput<VariantMap[Variant]>
    ) => Derived,
  ): Derived | undefined;
}

export type EnumVariants<VariantMap extends UnknownVariantMap> = {
  [Variant in keyof VariantMap & string]: EnumVariant<VariantMap, Variant>;
};

export type Enum<VariantMap extends UnknownVariantMap> =
  EnumVariants<VariantMap> & {
    [keys.id]: string;
  };

export type EnumVariantMap<E extends Enum<UnknownVariantMap>> =
  E extends Enum<infer VariantMap> ? VariantMap : never;

export type EnumValueFor<E extends Enum<UnknownVariantMap>> = EnumValue<
  EnumVariantMap<E>,
  keyof EnumVariantMap<E>
>;
