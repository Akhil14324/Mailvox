import express from 'express';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

router.post('/google/callback', async (req, res) => {
  try {
    const { access_token, refresh_token } = req.body;
    if (!access_token) {
      return res.status(400).json({ error: 'No access token provided' });
    }
    oauth2Client.setCredentials({ access_token, refresh_token: refresh_token || undefined });
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    const { id: googleId, email, name, picture } = data;
    if (!email) {
      return res.status(400).json({ error: 'Could not get user email' });
    }

    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.create({
        googleId,
        email,
        name: name || undefined,
        picture: picture || undefined,
        accessToken: access_token,
        refreshToken: refresh_token || undefined,
        tokenExpiry: new Date(Date.now() + 3600 * 1000),
      });
    } else {
      user.name = name || user.name;
      user.picture = picture || user.picture;
      user.accessToken = access_token;
      if (refresh_token) user.refreshToken = refresh_token;
      user.tokenExpiry = new Date(Date.now() + 3600 * 1000);
      await user.save();
    }

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
    console.error('Auth error:', err);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  const u = req.user;
  res.json({ user: { id: u._id, email: u.email, name: u.name, picture: u.picture } });
});

export default router;
