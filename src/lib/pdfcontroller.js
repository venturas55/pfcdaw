import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const logoPath = path.join(__dirname, '../public/img/logo-APV.svg');
const logoBase64 = fs.readFileSync(logoPath).toString('base64');

const defaultOptions = {
    format: 'A4',
    printBackground: false,
    displayHeaderFooter: true,
    footerTemplate: `
    <div style="font-size:10px; width:100%; text-align:center; padding:0 5mm;">
      Documento generado automáticamente – SISTEMAS de AYUDA a la NAVEGACIÓN <span style="float:right;">
        Página <span class="pageNumber"></span> de <span class="totalPages"></span>
      </span> 
    </div>
  `,
    headerTemplate: `<div style="font-size:25px; width:100%; text-align:center; padding:0 5mm;">INFORME TÉCNICO PREVENTIVO</div>
    <div style="width:50%; heigth: 50% ; text-align:center; padding:0 5mm;"><img src="data:image/svg+xml;base64,${logoBase64}" style="height:15px;"></div>
       
    `,
    margin: {
        top: '20mm',
        bottom: '20mm',   // IMPORTANTE
        left: '15mm',
        right: '15mm'
    }
};

async function htmlTopdf(html, options = defaultOptions) {
    const browser = await puppeteer.launch({ headless: 'new' })
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf(options);

    return pdfBuffer;

}

export default htmlTopdf;