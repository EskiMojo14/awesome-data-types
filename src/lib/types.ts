import type { StandardSchemaV1 } from "@standard-schema/spec";
import type * as keys from "./keys";

export interface AdtValue<
  Name extends string,
  Variant extends string,
  VariantSchema extends UnknownArraySchema,
> {
  readonly values: StandardSchemaV1.InferOutput<VariantSchema>;
  readonly variant: Variant;
  // dissuade
  readonly [keys.name]: Name;
  readonly [keys.type]: "value";
}

export type UnknownArraySchema = StandardSchemaV1<ReadonlyArray<unknown>>;

export type UnknownVariantMap = Record<string, UnknownArraySchema> &
  Partial<Record<keyof AdtStatic<any, any>, never>>;

export type UnknownAdtValue = AdtValue<string, string, UnknownArraySchema>;

export interface AdtVariant<
  Name extends string,
  Variant extends string,
  VariantSchema extends UnknownArraySchema,
> {
  /** parse and validate */
  (
    ...values: StandardSchemaV1.InferInput<VariantSchema>
  ): AdtValue<Name, Variant, VariantSchema>;
  /** skip parsing */
  from(
    ...values: StandardSchemaV1.InferOutput<VariantSchema>
  ): AdtValue<Name, Variant, VariantSchema>;

  readonly schema: VariantSchema;

  // dissuade
  readonly [keys.variant]: Variant;
  readonly [keys.name]: Name;
  readonly [keys.type]: "variant";
}

export type AdtVariants<
  Name extends string,
  VariantMap extends UnknownVariantMap,
> = {
  [Variant in keyof VariantMap & string]: AdtVariant<
    Name,
    Variant,
    VariantMap[Variant]
  >;
};

export interface AdtStatic<
  Name extends string,
  VariantMap extends UnknownVariantMap,
> {
  // dissuade
  readonly [keys.name]: Name;
  readonly [keys.type]: "ADT";
  // type-only
  readonly [keys.types]?: {
    variantMap: VariantMap;
  };
}

export type Adt<
  Name extends string,
  VariantMap extends UnknownVariantMap,
> = AdtVariants<Name, VariantMap> & AdtStatic<Name, VariantMap>;

export type AdtVariantMap<E extends Adt<any, any>> = NonNullable<
  E[typeof keys.types]
>["variantMap"];

export type AdtValueFor<E extends Adt<any, any>> = {
  [Variant in keyof AdtVariantMap<E> & string]: AdtValue<
    E[typeof keys.name],
    Variant,
    AdtVariantMap<E>[Variant]
  >;
}[keyof AdtVariantMap<E> & string];

export type ValueOf<T extends { schema: UnknownArraySchema }> =
  StandardSchemaV1.InferOutput<T["schema"]>;
export type InputFor<T extends { schema: UnknownArraySchema }> =
  StandardSchemaV1.InferInput<T["schema"]>;
