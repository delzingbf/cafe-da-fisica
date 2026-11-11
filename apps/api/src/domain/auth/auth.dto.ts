import type { ChangeAdminPasswordRequest, LoginRequest } from '@cafe-da-fisica/shared';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

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

export class ChangeAdminPasswordDto implements ChangeAdminPasswordRequest {
    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    @IsString()
    @MinLength(8)
    @MaxLength(128)
    newPassword: string;
}
