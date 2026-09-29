import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // AI Assistant endpoint
  app.post('/api/ai/assistant', async (req, res) => {
    try {
      const { message, studentContext } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: 'Gemini API key is not configured on the server. Please check your environment configuration.'
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = `You are AttendWise AI, an expert academic attendance advisor and student success mentor.
You help university students analyze their attendance, plan class attendance strategies, calculate class-skip margins, and stay compliant with university attendance regulations.

Student Context Data:
${studentContext ? JSON.stringify(studentContext, null, 2) : 'No student context provided.'}

Guidelines:
1. Always base your advice strictly on the student's actual attendance numbers and target percentages provided.
2. Be encouraging, concise, practical, and mathematically precise.
3. If they ask about skipping classes or required classes to attend, show the step-by-step logic clearly.
4. Formula for classes needed to reach target percentage T: find smallest integer n such that (attended + n) / (conducted + n) >= T/100.
5. Formula for classes that can be missed while maintaining target T: find largest integer n such that attended / (conducted + n) >= T/100.
6. Use clean Markdown formatting with bullet points and bold text where helpful.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nStudent Question: ${message}` }] }
        ]
      });

      const reply = response.text || "I couldn't generate a response. Please try again.";
      return res.json({ reply });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to process AI assistant request.'
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
