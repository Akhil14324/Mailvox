import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google/callback', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'No credential provided' });
    }

    // Verify the Google ID Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Could not get user email' });
    }

    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.create({
        googleId,
        email,
        name: name || undefined,
        picture: picture || undefined
      });
    } else {
      user.name = name || user.name;
      user.picture = picture || user.picture;
      await user.save();
    }

    // Generate App JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, picture: user.picture },
    });
  } catch (err) {
    console.error('DETAILED AUTH ERROR:', err);
    res.status(401).json({ error: 'Authentication failed. Check server logs.' });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  const u = req.user;
  if (!u) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: u._id, email: u.email, name: u.name, picture: u.picture } });
});

export default router; 