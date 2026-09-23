import { Router } from 'express'
import { bannerUpload, createBanner, deleteBanner, listAdminBanners, listBanners, toggleBanner, updateBanner } from '../controllers/bannerController.js'
import { requireAdmin } from '../middleware/adminAuth.js'
export const publicRouter = Router()
publicRouter.get('/', listBanners)
export const adminRouter = Router()
adminRouter.use(requireAdmin)
adminRouter.get('/banners', listAdminBanners)
adminRouter.post('/banners', bannerUpload, createBanner)
adminRouter.put('/banners/:id', bannerUpload, updateBanner)
adminRouter.put('/banners/:id/status', toggleBanner)
adminRouter.delete('/banners/:id', deleteBanner)
