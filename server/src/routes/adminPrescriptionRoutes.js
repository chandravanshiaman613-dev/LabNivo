import {Router} from 'express'
import {getPrescriptionLead,listPrescriptionLeads,updatePrescriptionStatus,viewPrescriptionFile} from '../controllers/prescriptionController.js'
import { requireAdmin } from '../middleware/adminAuth.js'
const router=Router();router.use(requireAdmin);router.get('/prescriptions',listPrescriptionLeads);router.get('/prescriptions/:leadId/file',viewPrescriptionFile);router.get('/prescriptions/:leadId',getPrescriptionLead);router.put('/prescriptions/:leadId/status',updatePrescriptionStatus);export default router
