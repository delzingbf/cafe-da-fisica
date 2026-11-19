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

/** Body of `POST /products`. Omitted flags take the database defaults (not vegan, available). */
export interface CreateProductRequest {
    name: string;
    /** Reais, greater than zero, at most two decimals. */
    price: number;
    type: ProductType;
    vegan?: boolean;
    /** `false` keeps the product on the menu but it cannot be ordered (e.g. sold out). */
    available?: boolean;
    /** `null` (or omitted) for no image. */
    imageUrl?: string | null;
}

/** Body of `PATCH /products/:id`: only the fields sent are changed. `imageUrl: null` removes the image. */
export type UpdateProductRequest = Partial<CreateProductRequest>;
