const dissuade = /* #__NO_SIDE_EFFECTS__ */ <T extends string>(key: T) => `~${key}` as const;

export const type: "~type" = dissuade("type");
export const name: "~name" = dissuade("name");
export const variant: "~variant" = dissuade("variant");
export const variants: "~variants" = dissuade("variants");
