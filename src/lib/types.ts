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

export type AnyEnumValue<VariantMap extends UnknownVariantMap> = EnumValue<
  VariantMap,
  keyof VariantMap & string
>;

export interface EnumVariant<
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap & string,
> {
  (...values: VariantMap[Variant]): EnumValue<VariantMap, Variant>;
  matches(
    value: AnyEnumValue<VariantMap>,
  ): value is EnumValue<VariantMap, Variant>;
  derive<Derived>(
    value: AnyEnumValue<VariantMap>,
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
