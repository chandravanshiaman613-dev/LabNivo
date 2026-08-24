import { Router } from 'express'
import { requireCustomer } from '../controllers/authController.js'
import { getMyOrder, listMyOrders } from '../controllers/bookingController.js'
const router = Router(); router.use(requireCustomer); router.get('/', listMyOrders); router.get('/:bookingId', getMyOrder); export default router
