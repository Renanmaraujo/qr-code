const express = require('express');
const chromium = require('chrome-aws-lambda');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/get-qrcode', async (req, res) => {
  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
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

    res.json({ base64: qrCodeBase64 });

  } catch (error) {
    console.error('Erro ao gerar QR Code:', error.message);
    res.send('Erro ao gerar QR Code.');
  } finally {
    if (browser) await browser.close();
  }
});

app.get('/', (req, res) => {
  res.send('Servidor QR Code online!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
