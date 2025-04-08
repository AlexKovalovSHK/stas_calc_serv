import { Module } from '@nestjs/common';
import { DocumentPdfService } from './document.service';

@Module({
    imports: [], 
  providers: [DocumentPdfService],  // Регистрируем сервис
  exports: [DocumentPdfService],    // Делаем доступным для других модулей
})
export class DocumentPdf3Module {}