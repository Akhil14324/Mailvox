import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './db/connect.js';
import { startEmailScheduler } from './jobs/emailScheduler.js';

import authRoutes from './routes/auth.js';
import generateRoutes from './routes/generate.js';
import sendRoutes from './routes/send.js';
import bulkRoutes from './routes/bulk.js';
import scheduleRoutes from './routes/schedule.js';
import templatesRoutes from './routes/templates.js';
import historyRoutes from './routes/history.js';

await connectDB();

const app = express();

aapp.use(cors({ 
  origin: ['https://mailvox-seven.vercel.app', 'http://localhost:3000'],
  credentials: true 
}));

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/send', sendRoutes);
app.use('/api/bulk', bulkRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/history', historyRoutes);

startEmailScheduler();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));