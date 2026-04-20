import { IsOptional, IsString, IsNumber, IsEmail, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class AcademicInfoDto {
    @IsOptional() @IsString()
    subdivision?: string;

    @IsOptional() @IsNumber()
    course?: number;

    @IsOptional() @IsString()
    sessionNumber?: string;

    @IsOptional() @IsDateString()
    enrollmentDate?: string;
}

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

    @IsOptional() @IsNumber()
    telegram_id?: number;

    @IsOptional() @IsString()
    telegram_username?: string;

    @IsOptional() @IsString()
    telegram_auth_hash?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => AcademicInfoDto)
    academicInfo?: AcademicInfoDto;
}