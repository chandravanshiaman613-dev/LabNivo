import bcrypt from 'bcryptjs'
import OtpRequest from '../models/OtpRequest.js'

export function generateOtp() { return String(Math.floor(100000 + Math.random() * 900000)) }
export async function sendOtp(mobile) {
  const now = new Date(); const existing = await OtpRequest.findOne({ mobile })
  if (existing && existing.resendAvailableAt > now) throw Object.assign(new Error('Please wait before requesting another OTP.'), { status: 429 })
  const otp = generateOtp(); const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); const resendAvailableAt = new Date(now.getTime() + 60 * 1000)
  await OtpRequest.findOneAndUpdate({ mobile }, { otpHash: await bcrypt.hash(otp, 10), expiresAt, resendAvailableAt, attempts: 0 }, { upsert: true, new: true })
  console.log(`[LAB NIVO DEV OTP] Mobile: ${mobile} | OTP: ${otp}`)
}
export async function verifyOtp(mobile, otp) {
  const request = await OtpRequest.findOne({ mobile }); const now = new Date()
  if (!request || request.expiresAt <= now) { if (request) await request.deleteOne(); return false }
  if (request.attempts >= 5) { await request.deleteOne(); return false }
  const valid = await bcrypt.compare(otp, request.otpHash)
  if (!valid) { request.attempts += 1; await request.save(); return false }
  await request.deleteOne(); return true
}
