import cron from 'node-cron';
import { google } from 'googleapis';
import ScheduledEmail from '../models/ScheduledEmail.js';
import SentEmail from '../models/SentEmail.js';
import User from '../models/User.js';

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

async function sendScheduled(spec) {
  const user = await User.findById(spec.userId);
  if (!user || !user.accessToken) {
    await ScheduledEmail.updateOne(
      { _id: spec._id },
      { status: 'failed', error: 'User or token missing' }
    );
    return;
  }
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ access_token: user.accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  try {
    const raw = encodeMessage(spec.to, spec.subject, spec.body);
    await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
    await ScheduledEmail.updateOne(
      { _id: spec._id },
      { status: 'sent', sentAt: new Date() }
    );
    await SentEmail.create({
      userId: spec.userId,
      to: spec.to,
      subject: spec.subject,
      status: 'sent',
      type: 'scheduled',
    });
  } catch (err) {
    await ScheduledEmail.updateOne(
      { _id: spec._id },
      { status: 'failed', error: err.message }
    );
    await SentEmail.create({
      userId: spec.userId,
      to: spec.to,
      subject: spec.subject,
      status: 'failed',
      type: 'scheduled',
      error: err.message,
    }).catch(() => {});
  }
}

export function startEmailScheduler() {
  cron.schedule('* * * * *', async () => {
    try {
      const due = await ScheduledEmail.find({
        status: 'pending',
        scheduledAt: { $lte: new Date() },
      }).lean();
      for (const spec of due) {
        await sendScheduled(spec);
      }
    } catch (err) {
      console.error('Scheduler error:', err);
    }
  });
  console.log('Email scheduler cron started (every minute)');
}
