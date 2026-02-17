import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class NewCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsOptional() // Позволяет присылать или не присылать цену
  priceAmount: number;

  @IsString()
  @IsOptional() // Добавьте это поле, если его нет!
  priceCurrency?: string;

  @IsString() // Если используете UUID, не ставьте @IsMongoId
  @IsNotEmpty()
  authorId: string;

  @IsString()
  @IsOptional()
  note?: string;
}