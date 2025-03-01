export type NotNullish = NonNullable<unknown>;
export type NonReducibleUnknown = NotNullish | null | undefined;
export type LooseAutocomplete<T> = T | NonReducibleUnknown;
export type NoInfer<T> = [T][T extends any ? 0 : never];
export type Override<T, U> = Omit<T, keyof U> & U;

export function assert(
  condition: unknown,
  message?: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export const objectKeys = Object.keys as <Obj extends object>(
  obj: Obj,
) => Array<keyof Obj>;

export const objectEntries = Object.entries as <Obj extends object>(
  obj: Obj,
) => Array<
  {
    [K in keyof Obj]: [K, Obj[K]];
  }[keyof Obj]
>;
