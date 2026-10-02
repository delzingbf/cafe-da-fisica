import { ProductType } from '@cafe-da-fisica/shared';

export interface FindAllParameters {
    name: string;
    available: boolean;
    type: ProductType;
    vegan: boolean;
}