import mongoose from 'mongoose';

const scheduledEmailSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  sentAt: { type: Date },
  error: { type: String },
}, { timestamps: true });

export default mongoose.model('ScheduledEmail', scheduledEmailSchema);
