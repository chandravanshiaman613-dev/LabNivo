import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { connectDB } from './config/db.js'
import testRoutes from './routes/testRoutes.js'
import packageRoutes from './routes/packageRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import adminBookingRoutes from './routes/adminBookingRoutes.js'
import prescriptionRoutes from './routes/prescriptionRoutes.js'
import adminPrescriptionRoutes from './routes/adminPrescriptionRoutes.js'
import authRoutes from './routes/authRoutes.js'
import myOrderRoutes from './routes/myOrderRoutes.js'
import quotationRoutes from './routes/quotationRoutes.js'
import adminQuotationRoutes from './routes/adminQuotationRoutes.js'
import adminCatalogueRoutes from './routes/adminCatalogueRoutes.js'
import { adminRouter as adminCouponRoutes, publicRouter as couponRoutes } from './routes/couponRoutes.js'
import { ensureInitialCoupon } from './controllers/couponController.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:5173', 'http://localhost:5174'] }))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: 'draft-8', legacyHeaders: false }))

app.get('/api/health', (_request, response) => {
  response.status(200).json({ success: true, message: 'LAB NIVO API is running' })
})

app.use('/api/tests', testRoutes)
app.use('/api/packages', packageRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/admin', adminBookingRoutes)
app.use('/api/prescriptions', prescriptionRoutes)
app.use('/api/admin', adminPrescriptionRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/my-orders', myOrderRoutes)
app.use('/api/quotations', quotationRoutes)
app.use('/api/admin', adminQuotationRoutes)
app.use('/api/admin', adminCatalogueRoutes)
app.use('/api/admin', adminCouponRoutes)
app.use('/api/coupons', couponRoutes)

app.use((_request, response) => response.status(404).json({ success: false, message: 'Route not found' }))
app.use((error, _request, response, _next) => {
  if (error instanceof Error && (error.name === 'MulterError' || error.message === 'File rejected')) return response.status(400).json({ success: false, message: 'Upload a JPG, PNG, or PDF file smaller than 5 MB.' })
  console.error(error)
  response.status(500).json({ success: false, message: 'Unexpected server error' })
})

async function startServer() {
  try {
    await connectDB()
    await ensureInitialCoupon()
    app.listen(port, () => console.log(`LAB NIVO API listening on port ${port}`))
  } catch (error) {
    console.error(`Unable to start LAB NIVO API: ${error.message}`)
    process.exit(1)
  }
}

startServer()
