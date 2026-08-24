import mongoose from 'mongoose'

const otpRequestSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true, match: /^\d{10}$/ },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  resendAvailableAt: { type: Date, required: true },
  attempts: { type: Number, default: 0, min: 0 },
}, { timestamps: true })

export default mongoose.model('OtpRequest', otpRequestSchema)
