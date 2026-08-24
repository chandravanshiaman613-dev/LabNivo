import { Router } from 'express'
import { requireAdmin } from '../middleware/adminAuth.js'
import { createAdminPackage, createAdminTest, listAdminPackages, listAdminTests, toggleAdminPackage, toggleAdminTest, updateAdminPackage, updateAdminTest } from '../controllers/adminCatalogueController.js'
const router = Router(); router.use(requireAdmin)
router.route('/tests').get(listAdminTests).post(createAdminTest); router.put('/tests/:id', updateAdminTest); router.put('/tests/:id/status', toggleAdminTest)
router.route('/packages').get(listAdminPackages).post(createAdminPackage); router.put('/packages/:id', updateAdminPackage); router.put('/packages/:id/status', toggleAdminPackage)
export default router
