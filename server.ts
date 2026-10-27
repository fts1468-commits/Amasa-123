import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

app.get('/download/cyberpanel', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'amasa-cyberpanel.zip');
  if (fs.existsSync(filePath)) {
    return res.download(filePath, 'amasa-cyberpanel.zip');
  }
  const distPath = path.join(__dirname, 'dist', 'amasa-cyberpanel.zip');
  if (fs.existsSync(distPath)) {
    return res.download(distPath, 'amasa-cyberpanel.zip');
  }
  return res.status(404).send('CyberPanel zip package not found. Please build the applet first.');
});

app.get('/download/dist', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'amasa-dist.zip');
  if (fs.existsSync(filePath)) {
    return res.download(filePath, 'amasa-dist.zip');
  }
  return res.status(404).send('Distribution package not found.');
});

app.get('/download/source', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'amasa-source.zip');
  if (fs.existsSync(filePath)) {
    return res.download(filePath, 'amasa-source.zip');
  }
  return res.status(404).send('Source package not found.');
});

app.get('/download/base44', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'amasa-base44.zip');
  if (fs.existsSync(filePath)) {
    return res.download(filePath, 'amasa-base44.zip');
  }
  const distPath = path.join(__dirname, 'dist', 'amasa-base44.zip');
  if (fs.existsSync(distPath)) {
    return res.download(distPath, 'amasa-base44.zip');
  }
  return res.status(404).send('Base44 zip package not found. Please build the applet first.');
});

app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, tone = 'marketing', contextType = 'general' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'يرجى كتابة نص أو فكرة الرسالة المطلوبة.' });
    }

    if (!ai && process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }

    const systemInstruction = `أنت مساعد ذكي مخصص لشاليهات واستراحات ماسة (AMASA) الفاخرة بالمملكة العربية السعودية (الترف، كوخ البيلسان، رانس، حمران - الما ونايا).
مهمتك: مساعدة الإدارة والمسوقين والحراس في صياغة رسائل واتساب احترافية ولبقة جداً، مثل:
- عروض ترويجية وأسعار وتخفيضات للشاليهات.
- رسائل تأكيد الحجز وإرسال بوليصة العربون وعقد الإيجار.
- رسائل ترحيبية وتوديعية من الحارس للنزلاء ومواعيد الدخول والخروج والتأمين.
- الردود الراقية على استفسارات العملاء.
الأسلوب: سعودي مهذب، مشرق، فخم، مع إيموجي منسقة، وتنسيق سطور ملائم للواتساب.
نوع النبرة المطلوبة: ${tone}. نوع المحتوى: ${contextType}.`;

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });
      return res.json({ text: response.text, model: 'gemini-3.8-flash', live: true });
    }

    const fallbackMessage = generateSmartFallback(prompt, tone, contextType);
    return res.json({ text: fallbackMessage, model: 'smart-template-engine', live: false });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const fallbackMessage = generateSmartFallback(req.body?.prompt || '', req.body?.tone, req.body?.contextType);
    return res.json({
      text: fallbackMessage,
      note: 'تم التوليد باستخدام المحرك الذكي الداخلي لشاليهات ماسة.',
      live: false,
    });
  }
});

function generateSmartFallback(prompt: string, tone?: string, contextType?: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('عربون') || p.includes('تأكيد') || p.includes('دفع') || contextType === 'booking') {
    return `أهلاً وسهلاً بك في استراحات وشاليهات ماسة الفاخرة ✨🌿\n\nنود إفادتكم بأنه تم تسجيل حجزكم المبدئي بنجاح 🎉\n\n🏡 *تفاصيل الحجز والضيافة:*\n• الشاليه: استراحات ماسة الراقية\n• لتأكيد وتثبيت الحجز نهائياً، نرجو التكرم بسداد العربون المعتمد.\n• رابط إتمام الدفع والعقد الموثق يتم إرساله فور التأكيد.\n\nنتشرف بخدمتكم ونتمنى لكم إقامة سعيدة ومميزة دائماً! 🤍🌸\n*إدارة شاليهات ماسة (AMASA)*`;
  }
  if (p.includes('حارس') || p.includes('دخول') || p.includes('ترحيب') || p.includes('خروج') || contextType === 'welcome') {
    return `مرحباً بكم ضيوفنا الكرام في شاليهات ماسة 🌟\nمعكم الحارس والمشرف الميداني (أبو راشد).\n\nيسعدنا استقبالكم اليوم، الشاليه جاهز ومُعقم ومكيف بالكامل لراحتكم 🏊‍♂️✨\n• موعد الدخول المعتمد: الساعة 3:00 عصراً\n• موعد الخروج: الساعة 12:00 ظهراً\n• في حال احتجتم لأي مساعدة أو فتح البوابة، أنا بالخدمة على مدار الساعة.\n\nإقامة ممتعة وهانئة بإذن الله! 🍃🌷`;
  }
  if (p.includes('عرض') || p.includes('تخفيض') || p.includes('ويكند') || p.includes('صيف') || p.includes('عيد')) {
    return `عزيزنا العميل، مرحباً بك في استراحات وشاليهات ماسة الفاخرة 💎✨\n\nعروض استثنائية بانتظارك لقضاء أروع الأوقات العائلية في أرقى شاليهاتنا:\n🌴 شاليه الترف · كوخ البيلسان · رانس · حمران (الما ونايا)\n\n🏊‍♂️ مسابح خاصة ونظيفة، مسطحات خضراء، مجالس فسيحة ومكيفة بالكامل.\nخصومات خاصة تبدأ من 15% للحجوزات المبكرة مع تأكيد فوري وعقد إلكتروني موثق.\n\nاحجز إقامتك الآن واستمتع بالخصوصية والراحة المطلقة! 📲🤍\n*شاليهات ماسة - ضيافة تليق بكم*`;
  }
  return `مرحباً بك في شاليهات ماسة الفاخرة ✨\n\nبناءً على طلبكم: ${prompt}\n\nنسعد دوماً بتقديم أرقى خدمات الضيافة في شاليهاتنا بالرياض. جميع مرافقنا مجهزة بأعلى معايير النظافة والخصوصية والراحة، مع إمكانية تعديل الحجوزات وإصدار العقود الرسمية المعتمدة فورياً.\n\nيسعدنا الرد على أي استفسار آخر وتلبية طلباتكم! 🌿🌸\n*شاليهات ماسة (AMASA)*`;
}

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';
  const PORT = process.env.PORT || 3000;

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
