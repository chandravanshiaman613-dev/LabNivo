import {Router} from 'express'
import {createPrescription,prescriptionUpload} from '../controllers/prescriptionController.js'
const router=Router();router.post('/',prescriptionUpload,createPrescription);export default router
