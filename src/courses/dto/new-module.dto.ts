import {
    IsArray,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    Max,
    MaxLength,
    Min,
  } from 'class-validator';
  
  export class NewModuleDto {
    @IsMongoId({ message: 'courseId must be a valid MongoDB ObjectId' })
    @IsNotEmpty()
    courseId: string;
  
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;
  
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    description: string;
  
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    topics?: string[] = [];
  
    @IsString()
    @IsOptional()
    homework?: string = '';
  
    @IsString()
    @IsOptional()
    @MaxLength(500)
    image?: string = '';
  
    @IsString()
    @IsNotEmpty()
    author: string;
  
    @IsNumber()
    @IsPositive()
    @Min(0)
    @Max(5)
    @IsOptional()
    rating?: number = 0;
  }