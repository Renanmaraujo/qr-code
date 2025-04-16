const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/get-qrcode', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
      executablePath: process.env.NODE_ENV === 'production'
        ? '/usr/bin/google-chrome'
        : undefined
    });

    const page = await browser.newPage();
    await page.goto('https://evo.valparaiso.pro/instance/connect/REnan', {
      waitUntil: 'networkidle2'
    });

    await page.waitForSelector('canvas');

    const qrCodeBase64 = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return canvas.toDataURL('image/png');
    });

    await browser.close();

    res.json({ base64: qrCodeBase64 });
  } catch (err) {
    console.error('Erro ao gerar QR Code:', err);
    res.status(500).send('Erro ao gerar QR Code.');
  }
});

app.get('/', (req, res) => {
  res.send('Servidor QR Code online!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
