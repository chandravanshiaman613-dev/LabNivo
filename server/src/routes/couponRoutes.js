import { Router } from 'express'
import { createCoupon, listCoupons, toggleCoupon, updateCoupon, validateCoupon } from '../controllers/couponController.js'
import { requireAdmin } from '../middleware/adminAuth.js'
const publicRouter = Router(); publicRouter.post('/validate', validateCoupon)
const adminRouter = Router(); adminRouter.use(requireAdmin); adminRouter.route('/coupons').get(listCoupons).post(createCoupon); adminRouter.put('/coupons/:id', updateCoupon); adminRouter.put('/coupons/:id/status', toggleCoupon)
export { publicRouter, adminRouter }
