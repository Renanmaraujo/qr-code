
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/get-qrcode', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new',
    });

    const page = await browser.newPage();
    await page.goto('https://evo.valparaiso.pro/instance/connect/REnan', {
      waitUntil: 'networkidle2',
      timeout: 60000 // aumenta tempo limite
    });

    await page.waitForSelector('canvas', { timeout: 20000 });

    const qrCodeBase64 = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return canvas ? canvas.toDataURL('image/png') : null;
    });

    await browser.close();

    if (!qrCodeBase64) {
      return res.status(500).send('Canvas não encontrado na página.');
    }

    res.json({ base64: qrCodeBase64 });

  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    res.status(500).send('Erro ao gerar QR Code.');
  }
});

app.get('/', (req, res) => {
  res.send('Servidor QR Code online!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
