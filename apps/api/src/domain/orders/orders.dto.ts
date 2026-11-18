import {
    ORDER_DELIVERY_METHODS,
    ORDER_PAYMENT_OPTIONS,
    ORDER_STATUSES,
    type CreateOrderItemRequest,
    type CreateOrderRequest,
    type OrderStatus,
    type OrderDeliveryMethod,
    type OrderPaymentOption,
} from '@cafe-da-fisica/shared';
import { Transform, Type } from 'class-transformer';
import {
    ArrayMinSize,
    ArrayUnique,
    IsDate,
    IsEmail,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsString,
    Min,
    MinDate,
    ValidateIf,
    ValidateNested,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateOrderItemDto implements CreateOrderItemRequest {
    @IsInt()
    @Min(1)
    productId: number;

    @IsInt()
    @Min(1)
    quantity: number;
}

// Implements the shared request type with `scheduledAt` as the Date it is converted to.
export class CreateOrderDto implements Omit<CreateOrderRequest, 'scheduledAt'> {
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

    // Sent as an ISO 8601 string. Compared with the clock at validation time, not at startup.
    @Type(() => Date)
    @IsDate()
    @MinDate(() => new Date(), { message: 'scheduledAt must be in the future' })
    scheduledAt: Date;

    // (order_id, product_id) is the primary key of order_items, so a product can appear only once.
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    @ArrayMinSize(1)
    @ArrayUnique((item: CreateOrderItemDto) => item.productId)
    items: CreateOrderItemDto[];
}

export class UpdateOrderStatusDto {
    @IsIn(ORDER_STATUSES)
    status: OrderStatus;
}
