const hide = <T extends string>(key: T) => ` ${key}` as const;
const dissuade = <T extends string>(key: T) => `~${key}` as const;

export const types = hide("types");
export const type = dissuade("type");
export const name = dissuade("name");
export const variant = dissuade("variant");
