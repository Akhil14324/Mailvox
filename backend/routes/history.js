import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import SentEmail from '../models/SentEmail.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const list = await SentEmail.find({ userId: req.user._id })
      .sort({ sentAt: -1 })
      .limit(500)
      .lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
