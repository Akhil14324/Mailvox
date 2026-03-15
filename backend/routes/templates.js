import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import Template from '../models/Template.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const list = await Template.find({ userId: req.user._id }).sort({ updatedAt: -1 }).lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, subject, body, tone } = req.body;
    if (!name || !subject || !body) {
      return res.status(400).json({ error: 'Missing name, subject, or body' });
    }
    const doc = await Template.create({
      userId: req.user._id,
      name,
      subject,
      body,
      tone: tone || undefined,
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, subject, body, tone } = req.body;
    const doc = await Template.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...(name != null && { name }), ...(subject != null && { subject }), ...(body != null && { body }), ...(tone != null && { tone }) },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Template not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await Template.deleteOne({ _id: req.params.id, userId: req.user._id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Template not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
