import puppeteer from 'puppeteer';
import { NewRechnungDto } from 'src/rechnung/dto/new-rechnung.dto';
import { pdfBody } from '.';

export async function generatePdf(rechnungDto: NewRechnungDto): Promise<Buffer> {
  const htmlContent = pdfBody(rechnungDto);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  await page.setContent(htmlContent, {
    waitUntil: 'networkidle0',
  });

  const pdfUint8Array = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px',
    },
  });

  await browser.close();

  const pdfBuffer = Buffer.from(pdfUint8Array); // 👈 преобразование

  return pdfBuffer;
}
