import type { LoginRequest } from '@cafe-da-fisica/shared';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto implements LoginRequest {
    // Admin emails are stored lowercase (CHK_admins_email_lowercase).
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
    @IsEmail()
    email: string;

    // Not trimmed: spaces are valid password characters.
    @IsString()
    @IsNotEmpty()
    password: string;
}
