import mongoose from 'mongoose';

const sentEmailSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: String, required: true },
  subject: { type: String, required: true },
  status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
  type: { type: String, enum: ['single', 'bulk', 'scheduled'], required: true },
  sentAt: { type: Date, default: Date.now },
  error: { type: String },
}, { timestamps: true });

export default mongoose.model('SentEmail', sentEmailSchema);
