import { IsMongoId, IsNumber, IsString, Max, Min } from 'class-validator';

export class ModuleResponseDto {
  @IsMongoId()
  id: string;

  @IsMongoId()
  courseId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString({ each: true })
  topics: string[];

  @IsString()
  homework: string;

  @IsString()
  image: string;

  @IsString()
  author: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  // Если хотите добавить timestamps в ответ (рекомендую)
  // createdAt: Date;
  // updatedAt: Date;
}