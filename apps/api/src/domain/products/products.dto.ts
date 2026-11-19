import { applyDecorators } from '@nestjs/common';
import {
    PRODUCT_TYPES,
    type CreateProductRequest,
    type ProductType,
    type UpdateProductRequest,
} from '@cafe-da-fisica/shared';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsIn,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUrl,
    Max,
    MaxLength,
    ValidateIf,
} from 'class-validator';

export interface FindAllParameters {
    name: string;
    available: boolean;
    type: ProductType;
    vegan: boolean;
}

// Rules shared by the create and update bodies; the update one makes each of them optional.

const Name = () =>
    applyDecorators(
        Transform(({ value }) => (typeof value === 'string' ? value.trim() : value)),
        IsString(),
        IsNotEmpty(),
        MaxLength(100),
    );

// NUMERIC(10,2) in the database, and CHK_products_price_positive.
const Price = () =>
    applyDecorators(
        IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false }),
        IsPositive(),
        Max(99_999_999.99),
    );

const Type = () => IsIn(PRODUCT_TYPES);

// A blank field means "no image".
const ImageUrl = () =>
    applyDecorators(
        Transform(({ value }) => (typeof value === 'string' ? value.trim() || null : value)),
        IsOptional(),
        IsUrl({ protocols: ['http', 'https'], require_protocol: true }),
        MaxLength(2048),
    );

/**
 * Skips the field's rules only when it was left out. Unlike `@IsOptional()` it still rejects
 * `null`, which these NOT NULL columns cannot take.
 */
const Optional = () => ValidateIf((_dto: object, value: unknown) => value !== undefined);

export class CreateProductDto implements CreateProductRequest {
    @Name()
    name: string;

    @Price()
    price: number;

    @Type()
    type: ProductType;

    @Optional()
    @IsBoolean()
    vegan?: boolean;

    @Optional()
    @IsBoolean()
    available?: boolean;

    @ImageUrl()
    imageUrl?: string | null;
}

export class UpdateProductDto implements UpdateProductRequest {
    @Optional()
    @Name()
    name?: string;

    @Optional()
    @Price()
    price?: number;

    @Optional()
    @Type()
    type?: ProductType;

    @Optional()
    @IsBoolean()
    vegan?: boolean;

    @Optional()
    @IsBoolean()
    available?: boolean;

    @ImageUrl()
    imageUrl?: string | null;
}
