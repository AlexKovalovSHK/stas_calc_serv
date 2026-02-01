import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    surname: string;

    @IsEmail({}, { message: 'Некорректный email' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
    password: string;

    @IsOptional()
    @IsString()
    phone?: string;
}