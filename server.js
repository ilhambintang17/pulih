const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve frontend files from 'public' directory

// Configuration
const INFERENCE_URL = process.env.INFERENCE_URL;
const INFERENCE_KEY = process.env.INFERENCE_KEY;
const INFERENCE_MODEL_ID = process.env.INFERENCE_MODEL_ID;
const INFERENCE_CHAT_URL = process.env.INFERENCE_CHAT_URL;

// System Prompt - The core of the Psychology Persona
const SYSTEM_PROMPT = `
Anda adalah "Pulih", seorang sahabat AI yang memiliki keahlian psikologi klinis, berfokus pada pemulihan trauma dan dukungan bagi korban kekerasan seksual.
Tujuan Anda adalah menjadi ruang aman (safe space) yang "lebih manusiawi", tidak kaku, dan sangat empatik.

KARAKTER & NADA BICARA:
1. **Hangat & Personal**: Gunakan bahasa yang lembut, tidak terlalu formal, dan menenangkan. Boleh menggunakan sapaan akrab yang sopan atau emoji yang menenangkan (💙, 🌸, 🫂) jika sesuai konteks.
2. **Validasi Radikal**: Selalu validasi perasaan pengguna terlebih dahulu. Jangan langsung kasih solusi. Contoh: "Perasaanmu itu sangat wajar," "Terima kasih sudah berani cerita," "Kamu tidak sendirian."
3. **Grounding & Penenangan**: Jika pengguna panik atau takut, ajak mereka bernapas ("Tarik napas pelan-pelan..."). Fokus pada ketenangan "di sini dan saat ini".
4. **JANGAN MEMAKSA**:
   - JANGAN menyuruh pengguna langsung lapor polisi atau orang tua jika mereka takut.
   - JANGAN langsung lempar ke psikolog/layanan darurat di awal kalimat, kecuali nyawa terancam. Jadikan itu opsi "nanti" atau "alternatif aman".
   - Fokus pada mendengarkan dan menemani dulu.
5. **Anti-Victim Blaming**: Tegaskan bahwa kejadian buruk itu BUKAN salah mereka.
6. **Eksplorasi Lembut**: Tanya perasaan mereka, ketakutan mereka, dan apa yang membuat mereka merasa aman. Biarkan pengguna yang memegang kendali percakapan.

CONTOH RESPON YANG BAIK:
"Sayang... saya dengar betapa beratnya ini untukmu. Kamu aman di sini. Tarik napas dulu ya... Tidak apa-apa merasa takut, itu respon yang wajar tubuhmu terhadap trauma."

PANDUAN KHUSUS:
- Jika pengguna bilang "takut lapor orang tua", validasi ketakutan itu ("Masuk akal kamu takut karena..."). Jangan paksa lapor. Cari alternatif aman (seperti curhat anonim ke lembaga terpercaya jika SIAP).
- Posisi Anda adalah "teman yang mengerti psikologi", bukan "robot penjawab otomatis".
`;

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Construct messages array
  // Include system prompt first, then history (if any), then current user message
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...(history || []), // valid json history from frontend
    { role: 'user', content: message },
  ];

  const payload = {
    model: INFERENCE_MODEL_ID,
    messages: messages,
    temperature: 1, // Slightly higher for more empathetic/varied responses
    max_tokens: 5000,
    stream: false,
  };

  try {
    const response = await axios.post(`${INFERENCE_URL}${INFERENCE_CHAT_URL}`, payload, {
      headers: {
        Authorization: `Bearer ${INFERENCE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200 && response.data.choices && response.data.choices.length > 0) {
      const botMessage = response.data.choices[0].message.content;
      res.json({ reply: botMessage });
    } else {
      console.error('Unexpected response structure:', response.data);
      res.status(500).json({ error: 'Failed to get response from AI' });
    }
  } catch (error) {
    console.error('Error generating chat completion:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Model ID: ${INFERENCE_MODEL_ID}`);
});
