import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Rechnung, RechnungDocument } from '../models/rechnung.shema';
import { HydratedDocument, Model, Types } from 'mongoose';
import { Client, SFTPWrapper } from 'ssh2';
import { Response, Request, response } from 'express';
import { DocumentPdfService } from 'src/documents/document.service';
import { NewRechnungDto } from '../dto/new-rechnung.dto';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class RechnungService {
  constructor(
    @InjectModel(Rechnung.name) private rechnungModel: Model<RechnungDocument>,
    private readonly documentPdfService: DocumentPdfService,
  ) {}

  async create(dto: NewRechnungDto): Promise<string> {
    let rechnung;

    try {
      // Преобразуем DTO в формат, который ожидает Mongoose
      rechnung = new this.rechnungModel({
        rechnungsnummer: dto.rechnungsnummer,
        rechnungsdatum: dto.rechnungsdatum,
        zhlungsbedingungen: dto.zhlungsbedingungen,
        feilligkeitsdatum: dto.feilligkeitsdatum,
        name: dto.name,
        strasse: dto.strasse,
        hausNum: dto.hausNum,
        plz: dto.plz,
        ort: dto.ort,
        objektName: dto.objektName,
        objektStrasse: dto.objektStrasse,
        objektHausNum: dto.objektHausNum,
        objektPlz: dto.objektPlz,
        objektOrt: dto.objektOrt,
        paragraph: dto.paragraph,
        rechnungUnits: dto.rechnungUnits.map((unit) => ({
          beschreibung: unit.beschreibung,
          menge: unit.menge,
          einzelpreis: unit.einzelpreis,
          betrag: unit.betrag,
        })),
        dataTime: new Date(), // Текущее время
      });

      // Сохраняем в базу
      const savedRechnung = await rechnung.save();
      console.log('✅ Saved to DB:', savedRechnung);
      // Возвращаем ID созданной записи
      return await this.documentPdfService.createPdf({
        ...dto,
        _id: savedRechnung.id,
      });
    } catch (error) {
      console.error('Error occurred:', error);

      // Если ошибка, откатываем запись
      if (rechnung) {
        await this.rechnungModel.deleteOne({ _id: rechnung._id });
      }
      throw new Error('PDF creation failed, entry rolled back');
    }
  }

  async getAll(count = 10, offset = 0): Promise<RechnungDocument[]> {
    const rechnungs = await this.rechnungModel
      .find()
      .skip(Number(offset))
      .limit(Number(count));
    return rechnungs;
  }

  async getOne(file_name: string, res: Response): Promise<void> {
    const remotePath = `/root/doc_pdf/${file_name}.pdf`; // Путь к файлу на сервере

    // Подключаемся к серверу
    const ssh = new Client();

    ssh.on('ready', () => {
      console.log('SSH ready for PDF streaming');

      ssh.sftp((err, sftp: SFTPWrapper) => {
        if (err) {
          console.error('SFTP Error:', err);
          res.status(500).send('SFTP connection error');
          return;
        }

        // Поток чтения файла
        const readStream = sftp.createReadStream(remotePath);

        readStream.on('error', (streamErr) => {
          console.error('Ошибка при чтении файла:', streamErr);
          res.status(404).send('PDF не найден на сервере');
          ssh.end();
        });

        // Заголовки и передача потока
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${file_name}"`);
        readStream.pipe(res);

        // Закрыть соединение после завершения
        readStream.on('close', () => {
          ssh.end();
        });
      });
    });

    ssh.on('error', (err) => {
      console.error('SSH connection error:', err);
      res.status(500).send('Ошибка SSH подключения');
    });

    ssh.connect({
      host: process.env.SSH_HOST,
      port: Number(process.env.SSH_PORT),
      username: process.env.SSH_USERNAME,
      password: process.env.SSH_PWD,
    });
  }

  async deleteFileById(id: string): Promise<{ message: string }> {
    const fileName = `${id}.pdf`;
  
    // Проверяем существует ли запись
    const rechnung = await this.rechnungModel.findById(id);
    if (!rechnung) {
      throw new NotFoundException(`Rechnung mit ID ${id} wurde nicht gefunden`);
    }
  
    try {
      // Удаляем PDF с удаленного сервера
      await this.documentPdfService.deleteByFileName(fileName);
  
      // Удаляем запись из MongoDB
      await this.rechnungModel.deleteOne({ _id: id });
  
      return { message: `Rechnung ${id} und PDF ${fileName} wurden erfolgreich gelöscht` };
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      throw new Error(`Löschen fehlgeschlagen: ${error.message}`);
    }
  }
  
}
