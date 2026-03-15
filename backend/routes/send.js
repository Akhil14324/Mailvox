import express from 'express';
import { google } from 'googleapis';
import { authMiddleware } from '../middleware/authMiddleware.js';
import SentEmail from '../models/SentEmail.js';

const router = express.Router();
router.use(authMiddleware);

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
  const raw = Buffer.from(lines.join('\r\n')).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  return raw;
}

router.post('/', async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Missing to, subject, or body' });
    }
    const user = req.user;
    if (!user.accessToken) {
      return res.status(400).json({ error: 'Gmail not connected. Please sign in again with Gmail scope.' });
    }
    const gmail = await getGmailClient(user.accessToken);
    const raw = encodeMessage(to, subject, body);
    await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
    await SentEmail.create({
      userId: user._id,
      to,
      subject,
      status: 'sent',
      type: 'single',
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Send error:', err);
    await SentEmail.create({
      userId: req.user._id,
      to: req.body.to,
      subject: req.body.subject,
      status: 'failed',
      type: 'single',
      error: err.message,
    }).catch(() => {});
    res.status(500).json({ error: err.message || 'Failed to send email' });
  }
});

export default router;
