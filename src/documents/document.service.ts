import { pdfBody } from '.';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path'; 
import { Client } from 'ssh2';
import { NewRechnungDto } from 'src/rechnung/dto/new-rechnung.dto';
import puppeteer from 'puppeteer'; 
import * as dotenv from 'dotenv';
dotenv.config();

export class DocumentPdfService {
  private sshClient: Client;

  constructor() {
    this.sshClient = new Client();
  }

  // Метод для подключения по SSH
  private async sftpConnect() {
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

  // Метод для создания директории на удалённом сервере
  private async sftpCreateDirectory(dirPath: string) {
    return new Promise<void>((resolve, reject) => {
      this.sshClient.sftp((err, sftp) => {
        if (err) {
          reject(err);
        } else {
          sftp.mkdir(dirPath, { recursive: true }, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }

  // Метод для загрузки файла на удалённый сервер
  private async sftpUploadFile(localFilePath: string, remoteFilePath: string) {
    return new Promise<void>((resolve, reject) => {
      this.sshClient.sftp((err, sftp) => {
        if (err) {
          reject(err);
        } else {
          sftp.fastPut(localFilePath, remoteFilePath, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }


async createPdf(rechnungDto: NewRechnungDto): Promise<string> {
  console.log(rechnungDto);

  const htmlContent = pdfBody(rechnungDto);
  const fileName = `${rechnungDto._id}.pdf`;
  const localFilePath = path.join(__dirname, fileName);

  // ✅ Генерация PDF с puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
  });

  await browser.close();

  // ✅ Сохраняем PDF в файл
  fs.writeFileSync(localFilePath, pdfBuffer);

  // 📂 Удалённая загрузка по SSH
  const remoteDir = '/root/doc_pdf';
  await this.sftpConnect(); // подключение по SSH
  const remoteFilePath = path.join(remoteDir, fileName);
  await this.sftpUploadFile(localFilePath, remoteFilePath);

  // 🧹 Удаляем локальный файл
  fs.unlinkSync(localFilePath);

  console.log('File uploaded to remote server:', remoteFilePath);
  return fileName;
}


  
    // Метод для удаления файла на удалённом сервере
    private async sftpDeleteFile(remoteFilePath: string) {
      return new Promise<void>((resolve, reject) => {
        this.sshClient.sftp((err, sftp) => {
          if (err) {
            reject(err);
          } else {
            sftp.unlink(remoteFilePath, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          }
        });
      });
    }

    // Метод для удаления файла по имени
    async deleteByFileName(fileName: string): Promise<void> {
      try {
        // Убедитесь, что SSH клиент подключен
        await this.sftpConnect();
  
        // Путь к удалённому файлу
        const remoteFilePath = path.join('/root/doc_pdf', fileName);
        
        // Удаление файла на удалённом сервере
        await this.sftpDeleteFile(remoteFilePath);
        console.log(`File ${fileName} deleted from remote server`);
      } catch (error) {
        console.error('Error deleting file:', error);
        throw new Error(`Failed to delete file ${fileName}: ${error.message}`);
      }
    }
  }
  
