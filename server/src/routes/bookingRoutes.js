import { Router } from 'express'
import { createBooking, getBookingForTracking, listBookingsForTracking } from '../controllers/bookingController.js'
const router = Router()
router.post('/', createBooking)
router.get('/', listBookingsForTracking)
router.get('/:bookingId', getBookingForTracking)
export default router
