// src/user/dto/create-student.dto.ts
import { IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from './new-user.dto';

class AcademicInfoDto {
  @IsEnum(['CHSM', 'OTHER'])
  subdivision: string;

  @IsNumber()
  course: number;

  @IsString()
  sessionNumber: string;

  @IsOptional()
  @IsString()
  @Type(() => Date)
  enrollmentDate?: string; // Придет строкой, в сервисе превратим в Date
}

export class CreateStudentDto extends CreateUserDto {
  @ValidateNested()
  @Type(() => AcademicInfoDto)
  @IsOptional()
  academicInfo?: AcademicInfoDto;
}