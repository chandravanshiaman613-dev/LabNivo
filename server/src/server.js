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

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(helmet())
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',').map(origin => origin.trim()).filter(Boolean)
const localOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174']
const productionOrigins = [
  'https://labnivo.pages.dev',
  'https://labnivo.in',
  'https://www.labnivo.in'
]
const corsOrigins = [...new Set([...localOrigins, ...productionOrigins, ...allowedOrigins])]
const corsOptions = {
  origin(origin, callback) {
    // Requests without an Origin header (health checks/server-to-server) do
    // not need browser CORS access. Browser origins remain allow-listed.
    if (!origin || corsOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Origin is not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}
// Register CORS before every API route. The explicit OPTIONS handler covers
// browser preflight requests as well as the automatic handling from `cors`.
app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))
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
    app.listen(port, () => console.log(`LAB NIVO API listening on port ${port}`))
  } catch (error) {
    console.error(`Unable to start LAB NIVO API: ${error.message}`)
    process.exit(1)
  }
}

startServer()
