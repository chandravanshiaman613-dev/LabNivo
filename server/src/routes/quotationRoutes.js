import { Router } from 'express'
import { requireCustomer } from '../controllers/authController.js'
import { approveQuotation, getCustomerQuotation } from '../controllers/quotationController.js'
const router = Router(); router.get('/:quotationId', requireCustomer, getCustomerQuotation); router.put('/:quotationId/approve', requireCustomer, approveQuotation); export default router
