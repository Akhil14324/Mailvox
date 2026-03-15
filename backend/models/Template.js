import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  tone: { type: String },
}, { timestamps: true });

export default mongoose.model('Template', templateSchema);
