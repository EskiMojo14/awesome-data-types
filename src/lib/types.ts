import type { StandardSchemaV1 } from "@standard-schema/spec";
import type * as keys from "./keys";

export interface ADTValue<
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
  Partial<Record<keyof ADTStatic<any, any>, never>>;

export type UnknownADTValue = ADTValue<string, string, UnknownArraySchema>;

export interface ADTVariant<
  Name extends string,
  Variant extends string,
  VariantSchema extends UnknownArraySchema,
> {
  /** parse and validate */
  (
    ...values: StandardSchemaV1.InferInput<VariantSchema>
  ): ADTValue<Name, Variant, VariantSchema>;
  /** skip parsing */
  from(
    ...values: StandardSchemaV1.InferOutput<VariantSchema>
  ): ADTValue<Name, Variant, VariantSchema>;

  readonly schema: VariantSchema;

  // dissuade
  readonly [keys.variant]: Variant;
  readonly [keys.name]: Name;
  readonly [keys.type]: "variant";
}

export type ADTVariants<
  Name extends string,
  VariantMap extends UnknownVariantMap,
> = {
  [Variant in keyof VariantMap & string]: ADTVariant<
    Name,
    Variant,
    VariantMap[Variant]
  >;
};

export interface ADTStatic<
  Name extends string,
  VariantMap extends UnknownVariantMap,
> {
  // dissuade
  readonly [keys.name]: Name;
  readonly [keys.type]: "ADT";
  // type-only
  [keys.types]?: {
    variantMap: VariantMap;
  };
}

export type ADT<
  Name extends string,
  VariantMap extends UnknownVariantMap,
> = ADTVariants<Name, VariantMap> & ADTStatic<Name, VariantMap>;

export type ADTVariantMap<E extends ADT<any, any>> = NonNullable<
  E[typeof keys.types]
>["variantMap"];

export type ADTValueFor<E extends ADT<any, any>> = {
  [Variant in keyof ADTVariantMap<E> & string]: ADTValue<
    E[typeof keys.name],
    Variant,
    ADTVariantMap<E>[Variant]
  >;
}[keyof ADTVariantMap<E> & string];

export type ValueOf<T extends { schema: UnknownArraySchema }> =
  StandardSchemaV1.InferOutput<T["schema"]>;
export type InputFor<T extends { schema: UnknownArraySchema }> =
  StandardSchemaV1.InferInput<T["schema"]>;
