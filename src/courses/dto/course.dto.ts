import { IsMongoId, IsNumber, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';
import { ModuleResponseDto } from './module.dto'; // или путь к файлу

export class CourseResponseDto {
  @IsMongoId()
  id: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  image: string;

  @IsString()
  author: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  @IsOptional()
  modules?: ModuleResponseDto[];

  createdAt: Date;
  updatedAt: Date;
}