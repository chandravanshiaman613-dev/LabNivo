import { Router } from 'express'
import { getTestBySlug, getTests } from '../controllers/testController.js'
const router = Router()
router.get('/', getTests)
router.get('/:slug', getTestBySlug)
export default router
