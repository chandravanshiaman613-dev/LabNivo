import { Router } from 'express'
import { getAdminBooking, listAdminBookings, updateBookingStatus } from '../controllers/bookingController.js'
import { requireAdmin } from '../middleware/adminAuth.js'
const router = Router()
router.use(requireAdmin)
router.get('/bookings', listAdminBookings)
router.get('/bookings/:bookingId', getAdminBooking)
router.put('/bookings/:bookingId/status', updateBookingStatus)
export default router
