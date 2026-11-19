import type { ProductType } from '@cafe-da-fisica/shared';

// DICIONARIO CONVERSÃO PARA PT BR
/** Category name shown for each product type (e.g. in the product pop-up). */
export const PRODUCT_TYPE_LABELS = {
    sweet: 'Doce',
    savory: 'Salgado',
    coffee: 'Café',
    other: 'Outros',
} satisfies Record<ProductType, string>;
