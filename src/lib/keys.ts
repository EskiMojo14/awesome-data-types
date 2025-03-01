const noSuggest = <T extends string>(key: T) => `  ${key}` as const;

export const id = noSuggest("id");
export const variant = noSuggest("variant");
export const variantMap = noSuggest("variantMap");
