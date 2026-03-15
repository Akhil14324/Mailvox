import express from 'express';
import Groq from 'groq-sdk';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TONES = ['Professional', 'Friendly', 'Formal', 'Casual', 'Assertive', 'Apologetic'];

router.post('/', async (req, res) => {
  try {
    const { recipientEmail, subject: optionalSubject, reason, tone, extraNotes } = req.body;
    const toneLabel = TONES.includes(tone) ? tone : 'Professional';

    const prompt = `You are an email assistant. Generate a single email with the following:
- Recipient context: ${reason || 'General message'}
- Tone: ${toneLabel}
${extraNotes ? `- Additional notes: ${extraNotes}` : ''}

Respond with ONLY valid JSON in this exact format, no other text:
{"subject": "Email subject line here", "body": "Full email body in plain text, use \\n for line breaks"}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const text = completion.choices[0]?.message?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Invalid AI response format' });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const subject = optionalSubject && optionalSubject.trim()
      ? optionalSubject.trim()
      : parsed.subject;

    res.json({ subject, body: parsed.body });
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate email' });
  }
});

export default router;