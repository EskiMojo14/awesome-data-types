export type NotNullish = NonNullable<unknown>;
export type NonReducibleUnknown = NotNullish | null | undefined;
export type LooseAutocomplete<T> = T | NonReducibleUnknown;
export type Override<T, U> = Omit<T, keyof U> & U;
export type AnyFn = (...args: any) => any;

/* #__NO_SIDE_EFFECTS__ */
export function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) throw new Error(message);
}

export const unsafeKeys = Object.keys as <Obj extends object>(obj: Obj) => Array<keyof Obj>;

export const unsafeEntries = Object.entries as <Obj extends object>(
  obj: Obj,
) => Array<
  {
    [K in keyof Obj]: [K, Obj[K]];
  }[keyof Obj]
>;
