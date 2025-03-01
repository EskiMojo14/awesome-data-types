import type { StandardSchemaV1 } from "@standard-schema/spec";
import type * as keys from "./keys";

export interface ADTValue<
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
  Partial<Record<keyof ADTStatic, never>>;

export type UnknownADTValue = ADTValue<
  string,
  StandardSchemaV1,
  UnknownVariantMap
>;

export interface ADTVariant<
  Variant extends string,
  VariantSchema extends UnknownArraySchema,
  VariantMap extends UnknownVariantMap,
> {
  /** parse and validate */
  (
    ...values: StandardSchemaV1.InferInput<VariantSchema>
  ): ADTValue<Variant, VariantSchema, VariantMap>;
  /** skip parsing */
  from(
    ...values: StandardSchemaV1.InferOutput<VariantSchema>
  ): ADTValue<Variant, VariantSchema, VariantMap>;

  readonly schema: VariantSchema;

  // internal
  [keys.type]: "variant";
  [keys.id]: string;
  [keys.variant]: Variant;
  // type-only
  [keys.variantMap]?: VariantMap;
}

export type ADTVariants<VariantMap extends UnknownVariantMap> = {
  [Variant in keyof VariantMap & string]: ADTVariant<
    Variant,
    VariantMap[Variant],
    VariantMap
  >;
};

export interface ADTStatic {
  // internal
  [keys.type]: "ADT";
  [keys.id]: string;
}

export type ADT<VariantMap extends UnknownVariantMap> =
  ADTVariants<VariantMap> & ADTStatic;

export type ADTVariantMap<E extends ADT<any>> =
  E extends ADT<infer VariantMap> ? VariantMap : never;

export type ADTValueFor<E extends ADT<any>> = ADTValue<
  keyof ADTVariantMap<E> & string,
  ADTVariantMap<E>[keyof ADTVariantMap<E>],
  ADTVariantMap<E>
>;
