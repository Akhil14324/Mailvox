import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import ScheduledEmail from '../models/ScheduledEmail.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const list = await ScheduledEmail.find({ userId: req.user._id, status: 'pending' })
      .sort({ scheduledAt: 1 })
      .lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { to, subject, body, scheduledAt } = req.body;
    if (!to || !subject || !body || !scheduledAt) {
      return res.status(400).json({ error: 'Missing to, subject, body, or scheduledAt' });
    }
    const at = new Date(scheduledAt);
    if (isNaN(at.getTime()) || at <= new Date()) {
      return res.status(400).json({ error: 'scheduledAt must be a future date/time' });
    }
    const doc = await ScheduledEmail.create({
      userId: req.user._id,
      to,
      subject,
      body,
      scheduledAt: at,
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const doc = await ScheduledEmail.findOne({ _id: req.params.id, userId: req.user._id });
    if (!doc) return res.status(404).json({ error: 'Scheduled email not found' });
    if (doc.status !== 'pending') return res.status(400).json({ error: 'Can only cancel pending emails' });
    await ScheduledEmail.deleteOne({ _id: doc._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
