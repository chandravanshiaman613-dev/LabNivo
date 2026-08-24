import { Router } from 'express'
import { sendOtpCode, verifyOtpCode } from '../controllers/authController.js'
import { adminLogin } from '../middleware/adminAuth.js'
const router = Router(); router.post('/send-otp', sendOtpCode); router.post('/verify-otp', verifyOtpCode); router.post('/admin/login', adminLogin); export default router
