import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputHtml = path.join(__dirname, 'gm_rulebook_full.html');
const outputPdf = path.join(__dirname, 'GM_Rulebook_KAI-I_KILL_v3.0.pdf');

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();
await page.goto(`file:///${inputHtml.replace(/\\/g, '/')}`, {
  waitUntil: 'networkidle0',
  timeout: 60000
});

await page.pdf({
  path: outputPdf,
  format: 'A4',
  printBackground: true,
  margin: {
    top: '20mm',
    bottom: '25mm',
    left: '18mm',
    right: '18mm'
  },
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: `
    <div style="width:100%; text-align:center; font-size:9px; color:#888; padding-top:5px;">
      <span>電脳怪異譚 KAI-I//KILL GM用総合ルールブック</span>
      <span style="margin-left:20px;">p.<span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>
  `
});

await browser.close();
console.log(`PDF generated: ${outputPdf}`);
