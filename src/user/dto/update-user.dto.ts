import { IsOptional, IsString, IsNumber, IsEmail } from 'class-validator';

export class UpdateUserDto {
    @IsOptional() @IsString()
    name?: string;

    @IsOptional() @IsString()
    surname?: string;

    @IsOptional() @IsEmail()
    email?: string;

    @IsOptional() @IsString()
    phone?: string;

    @IsOptional() @IsString()
    avatar?: string;

    // Данные для привязки Telegram
    @IsOptional() @IsNumber()
    telegram_id?: number;

    @IsOptional() @IsString()
    telegram_username?: string;

    @IsOptional() @IsString()
    telegram_auth_hash?: string; // Для проверки валидности данных от TG
}