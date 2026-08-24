import { Router } from 'express'
import { convertQuotation, createQuotation, getAdminQuotationForLead, setQuotationStatus } from '../controllers/quotationController.js'
import { requireAdmin } from '../middleware/adminAuth.js'
const router = Router(); router.use(requireAdmin); router.get('/prescriptions/:leadId/quotations', getAdminQuotationForLead); router.post('/prescriptions/:leadId/quotations', createQuotation); router.put('/quotations/:quotationId/status', setQuotationStatus); router.post('/quotations/:quotationId/convert', convertQuotation); export default router
