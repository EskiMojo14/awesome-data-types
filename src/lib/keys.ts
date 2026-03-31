const hide = /* #__NO_SIDE_EFFECTS__ */ <T extends string>(key: T) =>
  ` ${key}` as const;
const dissuade = /* #__NO_SIDE_EFFECTS__ */ <T extends string>(key: T) =>
  `~${key}` as const;

export const types: " types" = hide("types");
export const type: "~type" = dissuade("type");
export const name: "~name" = dissuade("name");
export const variant: "~variant" = dissuade("variant");
