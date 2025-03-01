import type { StandardSchemaV1 } from "@standard-schema/spec";
import type * as keys from "./keys";
export interface EnumValue<
  Variant extends string,
  VariantSchema extends StandardSchemaV1,
> {
  [keys.type]: "value";
  [keys.id]: string;
  [keys.variant]: Variant;
  values: StandardSchemaV1.InferOutput<VariantSchema>;
}

export type UnknownArraySchema = StandardSchemaV1<ReadonlyArray<unknown>>;

export type UnknownVariantMap = Record<string, UnknownArraySchema> &
  Partial<Record<keyof EnumStatic, never>>;

export type UnknownEnumValue = EnumValue<string, StandardSchemaV1>;

export interface EnumVariant<
  Variant extends string,
  VariantSchema extends UnknownArraySchema,
> {
  /** parse and validate */
  (
    ...values: StandardSchemaV1.InferInput<VariantSchema>
  ): EnumValue<Variant, VariantSchema>;
  /** skip parsing */
  from(
    ...values: StandardSchemaV1.InferOutput<VariantSchema>
  ): EnumValue<Variant, VariantSchema>;

  readonly schema: VariantSchema;

  [keys.type]: "variant";
  [keys.id]: string;
  [keys.variant]: Variant;
}

export type EnumVariants<VariantMap extends UnknownVariantMap> = {
  [Variant in keyof VariantMap & string]: EnumVariant<
    Variant,
    VariantMap[Variant]
  >;
};

export interface EnumStatic {
  [keys.type]: "enum";
  [keys.id]: string;
}

export type Enum<VariantMap extends UnknownVariantMap> =
  EnumVariants<VariantMap> & EnumStatic;

export type EnumVariantMap<E extends Enum<UnknownVariantMap>> =
  E extends Enum<infer VariantMap> ? VariantMap : never;

export type EnumValueFor<E extends Enum<UnknownVariantMap>> = EnumValue<
  keyof EnumVariantMap<E> & string,
  EnumVariantMap<E>[keyof EnumVariantMap<E>]
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
