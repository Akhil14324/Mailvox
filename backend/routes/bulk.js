import express from 'express';
import { google } from 'googleapis';
import Groq from 'groq-sdk';
import { authMiddleware } from '../middleware/authMiddleware.js';
import SentEmail from '../models/SentEmail.js';

const router = express.Router();
router.use(authMiddleware);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGmailClient(accessToken) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

function encodeMessage(to, subject, body) {
  const lines = [
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    body,
  ];
  return Buffer.from(lines.join('\r\n')).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
}

async function generatePersonalizedEmail(recipient, reason) {
  const customStr = recipient.customFields ? JSON.stringify(recipient.customFields) : '';
  const context = reason ? `Purpose: ${reason}. ` : '';
  const prompt = `Write a short, personalized email. ${context}Recipient name: ${recipient.name || 'there'}. ${customStr ? `Extra context: ${customStr}` : ''}
Respond with ONLY valid JSON, no other text:
{"subject": "subject line", "body": "email body plain text with \\n for newlines"}`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1024,
  });

  const text = completion.choices[0]?.message?.content || '{}';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : { subject: 'Hello', body: 'Hi there' };
}

router.post('/send', async (req, res) => {
  try {
    const { recipients, subject, body, personalized, reason } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Recipients array required' });
    }

    const user = req.user;
    if (!user.accessToken) {
      return res.status(400).json({ error: 'Gmail not connected. Please sign in again.' });
    }

    const gmail = await getGmailClient(user.accessToken);
    const results = [];

    if (personalized) {
      // Personalized mode — generate unique email per recipient
      for (let i = 0; i < recipients.length; i++) {
        const r = recipients[i];
        try {
          const generated = await generatePersonalizedEmail(r, reason);
          const raw = encodeMessage(r.email, generated.subject, generated.body);
          await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
          await SentEmail.create({ userId: user._id, to: r.email, subject: generated.subject, status: 'sent', type: 'bulk' });
          results.push({ email: r.email, status: 'sent' });
        } catch (e) {
          await SentEmail.create({ userId: user._id, to: r.email, subject: 'N/A', status: 'failed', type: 'bulk', error: e.message });
          results.push({ email: r.email, status: 'failed', error: e.message });
        }
        // Delay between sends to avoid rate limits
        if (i < recipients.length - 1) await new Promise((r) => setTimeout(r, 500));
      }
    } else {
      // Same email to all
      if (!subject || !body) {
        return res.status(400).json({ error: 'Subject and body required for same-email mode' });
      }
      for (const r of recipients) {
        try {
          const raw = encodeMessage(r.email, subject, body);
          await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
          await SentEmail.create({ userId: user._id, to: r.email, subject, status: 'sent', type: 'bulk' });
          results.push({ email: r.email, status: 'sent' });
        } catch (e) {
          await SentEmail.create({ userId: user._id, to: r.email, subject, status: 'failed', type: 'bulk', error: e.message });
          results.push({ email: r.email, status: 'failed', error: e.message });
        }
      }
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error('Bulk send error:', err);
    res.status(500).json({ error: err.message || 'Bulk send failed' });
  }
});

export default router;