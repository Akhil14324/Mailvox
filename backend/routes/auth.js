import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google/callback', async (req, res) => {
  try {
    const { access_token, credential } = req.body;

    let googleId, email, name, picture;

    if (credential) {
      // New GIS flow — verify ID token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    } else if (access_token) {
      // Old access token flow — fetch userinfo
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const data = await response.json();
      googleId = data.id;
      email = data.email;
      name = data.name;
      picture = data.picture;
    } else {
      return res.status(400).json({ error: 'No token provided' });
    }

    if (!email) return res.status(400).json({ error: 'Could not get user email' });

    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.create({
        googleId,
        email,
        name: name || undefined,
        picture: picture || undefined,
        accessToken: access_token || undefined,
      });
    } else {
      user.name = name || user.name;
      user.picture = picture || user.picture;
      if (access_token) user.accessToken = access_token;
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
    res.status(401).json({ error: 'Authentication failed' });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  const u = req.user;
  res.json({ user: { id: u._id, email: u.email, name: u.name, picture: u.picture } });
});

export default router;