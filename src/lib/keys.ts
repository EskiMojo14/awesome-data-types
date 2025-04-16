const hide = <T extends string>(key: T) => ` ${key}` as const;
const dissuade = <T extends string>(key: T) => `~${key}` as const;

export const types: " types" = /*#__PURE__*/ hide("types");
export const type: "~type" = /*#__PURE__*/ dissuade("type");
export const name: "~name" = /*#__PURE__*/ dissuade("name");
export const variant: "~variant" = /*#__PURE__*/ dissuade("variant");
