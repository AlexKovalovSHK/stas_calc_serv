import {
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
    Min,
  } from 'class-validator';
  
  export class NewCourseDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;
  
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    slug: string;
  
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    description: string;
  
    @IsNumber()
    @IsPositive()
    @Min(0)
    priceAmount: number;
  
    @IsString()
    @IsOptional()
    priceCurrency?: string = 'RUB';
  
    @IsMongoId()
    @IsNotEmpty()
    authorId: string;
  
    @IsString()
    @IsOptional()
    note?: string;
  }