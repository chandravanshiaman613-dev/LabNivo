import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import Banner from '../models/Banner.js'

const uploadDir = path.resolve('uploads/banners')
fs.mkdirSync(uploadDir, { recursive: true })
const types = new Set(['image/jpeg', 'image/png', 'image/webp'])
const extension = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }
const storage = multer.diskStorage({ destination: uploadDir, filename: (_request, file, done) => done(null, `banner-${crypto.randomUUID()}${extension[file.mimetype] || ''}`) })
export const bannerUpload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_request, file, done) => types.has(file.mimetype) ? done(null, true) : done(new Error('File rejected')) }).single('image')

const fallback = { type: 'TEXT', label: 'LIMITED TIME OFFER', title: 'UP TO 80% OFF', description: 'Save more on selected tests and health packages.', buttonText: 'Book Now →', buttonLink: '/tests', active: true, displayOrder: 1 }
const clean = body => ({ type: body.type === 'IMAGE' ? 'IMAGE' : 'TEXT', label: String(body.label || '').trim(), title: String(body.title || '').trim(), description: String(body.description || '').trim(), buttonText: String(body.buttonText || '').trim(), buttonLink: String(body.buttonLink || '').trim(), active: body.active !== false && body.active !== 'false', displayOrder: Math.max(0, Number(body.displayOrder) || 0) })
const validLink = value => !value || value.startsWith('/') || /^https?:\/\//i.test(value)
async function ensureDefault() { if (!await Banner.exists({})) await Banner.create(fallback) }
function removeFile(url) { if (url?.startsWith('/uploads/banners/')) fs.unlink(path.join(uploadDir, path.basename(url)), () => {}) }

export async function listBanners(_request, response, next) { try { await ensureDefault(); response.json({ success: true, data: await Banner.find({ active: true }).sort({ displayOrder: 1, createdAt: 1 }) }) } catch (error) { next(error) } }
export async function listAdminBanners(_request, response, next) { try { await ensureDefault(); response.json({ success: true, data: await Banner.find().sort({ displayOrder: 1, createdAt: 1 }) }) } catch (error) { next(error) } }
export async function createBanner(request, response, next) { try { const data = clean(request.body); if (!validLink(data.buttonLink)) { removeFile(request.file && `/uploads/banners/${request.file.filename}`); return response.status(400).json({ success: false, message: 'Button link must be a site path or http(s) URL.' }) } if (data.type === 'TEXT' && !data.title) return response.status(400).json({ success: false, message: 'Main heading is required for a text banner.' }); if (data.type === 'IMAGE' && !request.file) return response.status(400).json({ success: false, message: 'Choose a JPG, PNG, or WebP banner image under 5 MB.' }); if (request.file) data.imageUrl = `/uploads/banners/${request.file.filename}`; response.status(201).json({ success: true, data: await Banner.create(data) }) } catch (error) { next(error) } }
export async function updateBanner(request, response, next) { try { const data = clean(request.body); if (!validLink(data.buttonLink)) return response.status(400).json({ success: false, message: 'Button link must be a site path or http(s) URL.' }); const current = await Banner.findById(request.params.id); if (!current) return response.status(404).json({ success: false, message: 'Banner not found.' }); if (data.type === 'TEXT' && !data.title) return response.status(400).json({ success: false, message: 'Main heading is required for a text banner.' }); if (data.type === 'IMAGE' && !request.file && !current.imageUrl) return response.status(400).json({ success: false, message: 'Choose a JPG, PNG, or WebP banner image under 5 MB.' }); if (request.file) { data.imageUrl = `/uploads/banners/${request.file.filename}`; removeFile(current.imageUrl) } else data.imageUrl = current.imageUrl; response.json({ success: true, data: await Banner.findByIdAndUpdate(request.params.id, data, { new: true, runValidators: true }) }) } catch (error) { next(error) } }
export async function deleteBanner(request, response, next) { try { const data = await Banner.findByIdAndDelete(request.params.id); if (!data) return response.status(404).json({ success: false, message: 'Banner not found.' }); removeFile(data.imageUrl); response.json({ success: true }) } catch (error) { next(error) } }
export async function toggleBanner(request, response, next) { try { const data = await Banner.findByIdAndUpdate(request.params.id, { active: request.body.active !== false }, { new: true }); if (!data) return response.status(404).json({ success: false, message: 'Banner not found.' }); response.json({ success: true, data }) } catch (error) { next(error) } }
