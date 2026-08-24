import { Router } from 'express'
import { createBooking, getBookingForTracking } from '../controllers/bookingController.js'
const router = Router()
router.post('/', createBooking)
router.get('/:bookingId', getBookingForTracking)
export default router
