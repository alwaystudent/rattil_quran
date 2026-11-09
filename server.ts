import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client if API key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
}

// AI Recitation and Tajweed Assessment Endpoint
app.post('/api/gemini-recitation-check', async (req: Request, res: Response) => {
  try {
    const { expectedVerse, spokenTranscript, ayahNumber, surahName } = req.body;

    if (!expectedVerse || !spokenTranscript) {
      return res.status(400).json({ error: 'Missing expectedVerse or spokenTranscript' });
    }

    if (!aiClient) {
      return res.json({
        fallback: true,
        feedback: 'تم التقييم عبر المحلل اللحظي المحلي المدمج.',
      });
    }

    const prompt = `أنت محكم ومقرئ خبير في القرآن الكريم وأحكام التلاوة والتجويد.
الآية المقررة: "${expectedVerse}" (سورة ${surahName || ''} آية ${ayahNumber || ''})
ما قرأه المتدرب أو التقطه التعرف الصوتي: "${spokenTranscript}"

المطلوب:
1. دقة القراءة ومطابقة الكلمات (من 100).
2. تحديد أي كلمات ساقطة، أبدلت، أو زِيدت.
3. ملاحظة تشجيعية وتوجيهية موجزة بالعربية للمساعدة في التثبيت والحفظ المتقن.

أجب بصيغة JSON حصراً بالشكل التالي:
{
  "accuracy": 100,
  "isPerfect": true,
  "feedback": "تلاوة متقنة ومطابقة للرسم العثماني",
  "corrections": []
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);
    return res.json(parsed);
  } catch (err: any) {
    console.error('Gemini check error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Vite Middleware or Static Hosting
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer();
