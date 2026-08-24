import { Router } from 'express'
import { getPackageBySlug, getPackages } from '../controllers/packageController.js'
const router = Router()
router.get('/', getPackages)
router.get('/:slug', getPackageBySlug)
export default router
