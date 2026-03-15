import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  picture: { type: String },
  accessToken: { type: String },
  refreshToken: { type: String },
  tokenExpiry: { type: Date },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
