export const PRODUCT_TYPES = ['sweet', 'savory', 'coffee', 'other'] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];
