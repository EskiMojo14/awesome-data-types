import type { StandardSchemaV1 } from "@standard-schema/spec";
import type * as keys from "./keys";

export interface ADTValue<
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap & string,
  VariantSchema extends VariantMap[Variant],
> {
  values: StandardSchemaV1.InferOutput<VariantSchema>;
  // internal
  [keys.id]: string;
  [keys.type]: "value";
  [keys.variant]: Variant;
  // type-only
  [keys.variantMap]?: VariantMap;
}

export type UnknownArraySchema = StandardSchemaV1<ReadonlyArray<unknown>>;

export type UnknownVariantMap = Record<string, UnknownArraySchema> &
  Partial<Record<keyof ADTStatic, never>>;

export type UnknownADTValue = ADTValue<
  UnknownVariantMap,
  string,
  UnknownArraySchema
>;

export interface ADTVariant<
  VariantMap extends UnknownVariantMap,
  Variant extends keyof VariantMap & string,
  VariantSchema extends VariantMap[Variant],
> {
  /** parse and validate */
  (
    ...values: StandardSchemaV1.InferInput<VariantSchema>
  ): ADTValue<VariantMap, Variant, VariantSchema>;
  /** skip parsing */
  from(
    ...values: StandardSchemaV1.InferOutput<VariantSchema>
  ): ADTValue<VariantMap, Variant, VariantSchema>;

  readonly schema: VariantSchema;

  // internal
  [keys.id]: string;
  [keys.type]: "variant";
  [keys.variant]: Variant;
  // type-only
  [keys.variantMap]?: VariantMap;
}

export type ADTVariants<VariantMap extends UnknownVariantMap> = {
  [Variant in keyof VariantMap & string]: ADTVariant<
    VariantMap,
    Variant,
    VariantMap[Variant]
  >;
};

export interface ADTStatic {
  // internal
  [keys.id]: string;
  [keys.type]: "ADT";
}

export type ADT<VariantMap extends UnknownVariantMap> =
  ADTVariants<VariantMap> & ADTStatic;

export type ADTVariantMap<E extends ADT<any>> =
  E extends ADT<infer VariantMap> ? VariantMap : never;

export type ADTValueFor<E extends ADT<any>> = {
  [Variant in keyof ADTVariantMap<E> & string]: ADTValue<
    ADTVariantMap<E>,
    Variant,
    ADTVariantMap<E>[Variant]
  >;
}[keyof ADTVariantMap<E> & string];

export type ValueOf<T extends { schema: UnknownArraySchema }> =
  StandardSchemaV1.InferOutput<T["schema"]>;
export type InputFor<T extends { schema: UnknownArraySchema }> =
  StandardSchemaV1.InferInput<T["schema"]>;
