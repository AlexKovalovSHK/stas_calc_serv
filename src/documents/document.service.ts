import { NewRechnungDto } from 'src/rechnung/dto/new-rechnung.dto';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'ssh2';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as dotenv from 'dotenv';
import { Injectable } from '@nestjs/common';

dotenv.config();

@Injectable()
export class DocumentPdfService {
  private sshClient: Client;

  constructor() {
    this.sshClient = new Client();
  }

  private async sftpConnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.sshClient
        .on('ready', () => {
          console.log('SSH Client connected');
          resolve();
        })
        .on('error', (err) => {
          console.error('SSH Connection error:', err);
          reject(err);
        })
        .connect({
          host: process.env.SSH_HOST,
          port: Number(process.env.SSH_PORT),
          username: process.env.SSH_USERNAME,
          password: process.env.SSH_PWD,
        });
    });
  }

  private async sftpUploadFile(localFilePath: string, remoteFilePath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.sshClient.sftp((err, sftp) => {
        if (err) {
          reject(err);
          return;
        }
        
        sftp.fastPut(localFilePath, remoteFilePath, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }

  private async sftpDeleteFile(remoteFilePath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.sshClient.sftp((err, sftp) => {
        if (err) {
          reject(err);
          return;
        }

        sftp.unlink(remoteFilePath, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }

  private async generatePdfContent(rechnungDto: NewRechnungDto): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points

    // Load fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Set initial coordinates and dimensions
    const margin = 50;
    let y = page.getHeight() - margin;
    const lineHeight = 12;
    const smallLineHeight = 10;
    const fontSize = 10;
    const smallFontSize = 8;

    // Helper function to draw text
    const drawText = (text: string, x: number, y: number, options: {
      size?: number,
      bold?: boolean,
      maxWidth?: number
    } = {}) => {
      page.drawText(text, {
        x,
        y,
        size: options.size || fontSize,
        font: options.bold ? helveticaBold : helveticaFont,
        color: rgb(0, 0, 0),
        maxWidth: options.maxWidth || (page.getWidth() - 2 * margin),
      });
    };

    // Header section
    drawText('Marius Ursoi', margin, y, { size: smallFontSize });
    drawText('Im Barm 13 - 30916 - Isernhagen', margin, y - smallLineHeight, { size: smallFontSize });
    
    // Right-aligned invoice info
    const invoiceInfo = [
      `Rechnungsnummer: ${rechnungDto.rechnungsnummer}`,
      `Rechnungsdatum: ${rechnungDto.rechnungsdatum}`,
      `Zahlungsbedingungen: ${rechnungDto.zhlungsbedingungen}`,
      `Fälligkeitsdatum: ${rechnungDto.feilligkeitsdatum}`,
    ];
    
    let infoY = y;
    invoiceInfo.forEach(line => {
      const textWidth = helveticaFont.widthOfTextAtSize(line, smallFontSize);
      drawText(line, page.getWidth() - margin - textWidth, infoY, { size: smallFontSize });
      infoY -= smallLineHeight;
    });
    
    y -= 2 * lineHeight;

    // Billing address
    drawText('Rechnungsadresse', margin, y, { bold: true, size: smallFontSize });
    y -= smallLineHeight;
    drawText(rechnungDto.name, margin, y, { size: smallFontSize });
    y -= smallLineHeight;
    drawText(`${rechnungDto.strasse} ${rechnungDto.hausNum}`, margin, y, { size: smallFontSize });
    y -= smallLineHeight;
    drawText(`${rechnungDto.plz} ${rechnungDto.ort}`, margin, y, { size: smallFontSize });
    
    y -= lineHeight;
    
    // Delivery address
    drawText('Lieferadresse', margin, y, { bold: true, size: smallFontSize });
    y -= smallLineHeight;
    drawText(rechnungDto.objektName, margin, y, { size: smallFontSize });
    y -= smallLineHeight;
    drawText(`${rechnungDto.objektStrasse} ${rechnungDto.objektHausNum}`, margin, y, { size: smallFontSize });
    y -= smallLineHeight;
    drawText(`${rechnungDto.objektPlz} ${rechnungDto.objektOrt}`, margin, y, { size: smallFontSize });
    
    y -= 2 * lineHeight;

    // Table headers
    const columnWidths = [250, 90, 90, 90];
    const tableHeaders = ['Beschreibung', 'Menge', 'Einzelpreis', 'Betrag'];
    
    let tableX = margin;
    tableHeaders.forEach((header, i) => {
      drawText(header, tableX, y, { bold: true });
      tableX += columnWidths[i];
    });
    
    // Draw line under headers
    page.drawLine({
      start: { x: margin, y: y - 2 },
      end: { x: page.getWidth() - margin, y: y - 2 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    
    y -= lineHeight;

    // Table rows
    rechnungDto.rechnungUnits?.forEach(unit => {
      tableX = margin;
      const rowItems = [
        unit.beschreibung,
        unit.menge.toString(),
        `${unit.einzelpreis.toFixed(2)}€`,
        `${unit.betrag.toFixed(2)}€`,
      ];
      
      rowItems.forEach((item, i) => {
        drawText(item, tableX, y, { size: fontSize });
        tableX += columnWidths[i];
      });
      
      // Draw line under row
      page.drawLine({
        start: { x: margin, y: y - 15 },
        end: { x: page.getWidth() - margin, y: y - 15 },
        thickness: 0.5,
        color: rgb(0.9, 0.9, 0.9),
      });
      
      y -= lineHeight;
    });
    
    y -= lineHeight;

    // Total row
    const totalAmount = rechnungDto.rechnungUnits
      .reduce((sum, unit) => sum + unit.betrag, 0)
      .toFixed(2);
    
    drawText('Gesamtbetrag:', page.getWidth() - margin - 160, y, { bold: true });
    drawText(`${totalAmount}€`, page.getWidth() - margin - 80, y, { bold: true });
    
    y -= 2 * lineHeight;

    // Footer text
    drawText(`Gemäß §${rechnungDto.paragraph} Abs. 1 UStG enthält der ausgewiesene Betrag keine Umsatzsteuer.`, 
      margin, y, { size: smallFontSize });
    y -= smallLineHeight;
    drawText('Bitte überweisen Sie den Gesamtpreis innerhalb von 7 Tagen auf das unten angegebene Bankkonto.', 
      margin, y, { size: smallFontSize });
    
    y -= 2 * lineHeight;

    // Draw line
    page.drawLine({
      start: { x: margin, y: y },
      end: { x: page.getWidth() - margin, y: y },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
    
    y -= lineHeight;

    // Bank details
    const bankDetails = [
      'Kontoinhaber: Marius Ursoi Bank: Sparkasse Hannover SWIFT/BIC: SPKHDE2HXXX IBAN: DE43250501800910582947 Adresse: Im Barm 13 - 30916 - Isernhagen E-Mail: mariusursoi18@gmail.com Mobil: 017684677759 Paypal: mariusursoi18@gmail.com'
    ];
    
    bankDetails.forEach(line => {
      drawText(line, margin, y, { size: smallFontSize });
      y -= smallLineHeight;
    });

    return await pdfDoc.save();
  }

  async createPdf(rechnungDto: NewRechnungDto): Promise<string> {
    if (!rechnungDto._id) {
      throw new Error('Rechnung ID is required');
    }

    const fileName = `${rechnungDto._id}.pdf`;
    const localTempDir = path.join(__dirname, 'temp_pdfs');
    const localFilePath = path.join(localTempDir, fileName);
    const remoteDir = '/root/doc_pdf';
    const remoteFilePath = path.join(remoteDir, fileName);

    try {
      // Create temp directory if not exists
      if (!fs.existsSync(localTempDir)) {
        fs.mkdirSync(localTempDir, { recursive: true });
      }

      // Generate PDF
      const pdfBytes = await this.generatePdfContent(rechnungDto);
      fs.writeFileSync(localFilePath, pdfBytes);

      // Upload to remote server
      await this.sftpConnect();
      await this.sftpUploadFile(localFilePath, remoteFilePath);
      console.log(`PDF successfully uploaded to ${remoteFilePath}`);

      // Clean up local temp file
      fs.unlinkSync(localFilePath);

      return fileName;
    } catch (error) {
      // Clean up in case of error
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
      console.error('Error creating PDF:', error);
      throw new Error(`Failed to create PDF: ${error.message}`);
    } finally {
      this.sshClient.end();
    }
  }

  async deleteByFileName(fileName: string): Promise<void> {
    const remoteFilePath = path.join('/root/doc_pdf', fileName);

    try {
      await this.sftpConnect();
      await this.sftpDeleteFile(remoteFilePath);
      console.log(`File ${fileName} deleted from remote server`);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file ${fileName}: ${error.message}`);
    } finally {
      this.sshClient.end();
    }
  }
}