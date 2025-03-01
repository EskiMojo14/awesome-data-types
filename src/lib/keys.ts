const noSuggest = <T extends string>(key: T) => ` ${key}` as const;

export const id = noSuggest("id");
export const type = noSuggest("type");
export const variantMap = noSuggest("variantMap");
