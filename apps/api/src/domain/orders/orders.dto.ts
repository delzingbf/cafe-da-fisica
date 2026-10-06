import {
    ORDER_DELIVERY_METHODS,
    ORDER_PAYMENT_OPTIONS,
    type OrderDeliveryMethod,
    type OrderPaymentOption,
} from '@cafe-da-fisica/shared';
import { Transform, Type } from 'class-transformer';
import {
    ArrayMinSize,
    ArrayUnique,
    IsEmail,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsString,
    Min,
    ValidateIf,
    ValidateNested,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateOrderItemDto {
    @IsInt()
    @Min(1)
    productId: number;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class CreateOrderDto {
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    customerName: string;

    // The database only accepts lowercase emails (CHK_orders_customer_email_lowercase).
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
    @IsEmail()
    customerEmail: string;

    @IsIn(ORDER_PAYMENT_OPTIONS)
    paymentOption: OrderPaymentOption;

    @IsIn(ORDER_DELIVERY_METHODS)
    deliveryMethod: OrderDeliveryMethod;

    // Required for deliveries only; ignored for pickups.
    @ValidateIf((dto: CreateOrderDto) => dto.deliveryMethod === 'delivery')
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    deliveryLocation?: string;

    // (order_id, product_id) is the primary key of order_items, so a product can appear only once.
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    @ArrayMinSize(1)
    @ArrayUnique((item: CreateOrderItemDto) => item.productId)
    items: CreateOrderItemDto[];
}
