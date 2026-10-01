export const PRODUCT_TYPES = ['sweet', 'savory', 'coffee', 'other'] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export interface ProductResponse {
    id: number;
    name: string;
    price: number;
    available: boolean;
    type: ProductType;
    vegan: boolean;
    imageUrl: string | null;
}
