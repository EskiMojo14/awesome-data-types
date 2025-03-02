const hide = <T extends string>(key: T) => ` ${key}` as const;
const dissuade = <T extends string>(key: T) => `~${key}` as const;

export const types = /*#__PURE__*/ hide("types");
export const type = /*#__PURE__*/ dissuade("type");
export const name = /*#__PURE__*/ dissuade("name");
export const variant = /*#__PURE__*/ dissuade("variant");
