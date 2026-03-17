import express from 'express';
import { google } from 'googleapis';
import { authMiddleware } from '../middleware/authMiddleware.js';
import SentEmail from '../models/SentEmail.js';

const router = express.Router();
router.use(authMiddleware);

// Helper to initialize Gmail API
async function getGmailClient(accessToken) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

// Helper to encode the email for Gmail API
function encodeMessage(to, subject, body) {
  const lines = [
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    body,
  ];
  const email = lines.join('\r\n');
  return Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
}

router.post('/', async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    const user = req.user; // Set by authMiddleware

    // 1. Check if the user has connected Gmail
    if (!user.accessToken) {
      return res.status(400).json({ 
        error: 'Gmail not connected. Please sign in again with Gmail scope.' 
      });
    }

    // 2. Initialize Gmail client
    const gmail = await getGmailClient(user.accessToken);

    // 3. Prepare and Send
    const raw = encodeMessage(to, subject, body);
    
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });

    // 4. Log to history
    await SentEmail.create({
      userId: user._id,
      to,
      subject,
      status: 'sent',
      type: 'single',
    });

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (err) {
    console.error('Send error:', err);
    
    // Handle expired tokens
    if (err.code === 401) {
      return res.status(401).json({ 
        error: 'Gmail session expired. Please reconnect Gmail.' 
      });
    }

    res.status(500).json({ error: err.message || 'Failed to send email' });
  }
});

export default router;