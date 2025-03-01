import type * as keys from "./keys";

export interface EnumValue<
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap,
> {
  [keys.id]: string;
  [keys.variant]: Variant;
  values: VariantMap[Variant];
}

export type UnknownVariantMap = Record<string, ReadonlyArray<unknown>>;

export type UnknownEnumValue = EnumValue<UnknownVariantMap, string>;

export interface EnumVariant<
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap & string,
> {
  (...values: VariantMap[Variant]): EnumValue<VariantMap, Variant>;
  matches(value: UnknownEnumValue): value is EnumValue<VariantMap, Variant>;
  derive<Derived>(
    value: UnknownEnumValue,
    derive: (...values: VariantMap[Variant]) => Derived,
  ): Derived | undefined;
}

export type EnumVariants<VariantMap extends UnknownVariantMap> = {
  [Variant in keyof VariantMap & string]: EnumVariant<VariantMap, Variant>;
};

export type Enum<VariantMap extends UnknownVariantMap> =
  EnumVariants<VariantMap> & {
    [keys.id]: string;
  };
