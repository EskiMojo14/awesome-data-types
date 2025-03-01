import type { StandardSchemaV1 } from "@standard-schema/spec";
import type * as keys from "./keys";

export interface EnumValue<
  Variant extends string,
  VariantSchema extends StandardSchemaV1,
  VariantMap extends UnknownVariantMap,
> {
  values: StandardSchemaV1.InferOutput<VariantSchema>;
  // internal
  [keys.type]: "value";
  [keys.id]: string;
  [keys.variant]: Variant;
  // type-only
  [keys.variantMap]?: VariantMap;
}

export type UnknownArraySchema = StandardSchemaV1<ReadonlyArray<unknown>>;

export type UnknownVariantMap = Record<string, UnknownArraySchema> &
  Partial<Record<keyof EnumStatic, never>>;

export type UnknownEnumValue = EnumValue<
  string,
  StandardSchemaV1,
  UnknownVariantMap
>;

export interface EnumVariant<
  Variant extends string,
  VariantSchema extends UnknownArraySchema,
  VariantMap extends UnknownVariantMap,
> {
  /** parse and validate */
  (
    ...values: StandardSchemaV1.InferInput<VariantSchema>
  ): EnumValue<Variant, VariantSchema, VariantMap>;
  /** skip parsing */
  from(
    ...values: StandardSchemaV1.InferOutput<VariantSchema>
  ): EnumValue<Variant, VariantSchema, VariantMap>;

  readonly schema: VariantSchema;

  // internal
  [keys.type]: "variant";
  [keys.id]: string;
  [keys.variant]: Variant;
  // type-only
  [keys.variantMap]?: VariantMap;
}

export type EnumVariants<VariantMap extends UnknownVariantMap> = {
  [Variant in keyof VariantMap & string]: EnumVariant<
    Variant,
    VariantMap[Variant],
    VariantMap
  >;
};

export interface EnumStatic {
  [keys.type]: "enum";
  [keys.id]: string;
}

export type Enum<VariantMap extends UnknownVariantMap> =
  EnumVariants<VariantMap> & EnumStatic;

export type EnumVariantMap<E extends Enum<any>> =
  E extends Enum<infer VariantMap> ? VariantMap : never;

export type EnumValueFor<E extends Enum<any>> = EnumValue<
  keyof EnumVariantMap<E> & string,
  EnumVariantMap<E>[keyof EnumVariantMap<E>],
  EnumVariantMap<E>
>;
