import { Body, Controller, Delete, Get, HttpException, HttpStatus, Injectable, NotFoundException, Param, Post, Res } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Rechnung, RechnungDocument } from "../models/rechnung.shema";
import { HydratedDocument, Model } from "mongoose";
import { RechnungPosition, RechnungPositionDocument } from "../models/rechnung-position.shema";
import { RechnungService } from "../service/rechnung.service";
import { Response, Request } from 'express';
import path, { join } from "path";
import { NewRechnungDto } from "../dto/new-rechnung.dto";


@Controller('api/v1/rechnungs')
export class RechnungController {
constructor(private rechnungService: RechnungService) {    }

  
@Post()
async create(@Body() dto: NewRechnungDto): Promise<string> {
  try {
    // Вызов сервиса для создания счета
    const result = await this.rechnungService.create(dto);
    
    // Возвращаем результат в виде ID новой записи
    return result;
  } catch (error) {
    // Обработка ошибки и возврат более конкретного ответа
    throw new HttpException(
      {
        message: 'Failed to create Rechnung',
        error: error.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}


@Get()
  async getAll(count = 10, offset = 0): Promise<RechnungDocument[]> {
    return this.rechnungService.getAll(count, offset);
  }

  @Get(':id')
   getOne(@Param('id') id: string, @Res() res: Response,):Promise<void> {
    return this.rechnungService.getOne(id, res);
  }

  @Delete(':id')
  async delete(@Param('id')id: string): Promise<{ message: string }> {
    return this.rechnungService.deleteFileById(id);
  }

}