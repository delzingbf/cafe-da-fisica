import type { UpdateOrderNotificationEmailRequest } from '@cafe-da-fisica/shared';
import { Transform } from 'class-transformer';
import { IsEmail, MaxLength } from 'class-validator';

export class UpdateOrderNotificationEmailDto implements UpdateOrderNotificationEmailRequest {
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
    @IsEmail()
    @MaxLength(254)
    email: string;
}
