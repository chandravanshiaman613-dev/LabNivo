import Coupon from '../models/Coupon.js'
import Booking from '../models/Booking.js'
import Customer from '../models/Customer.js'

const asDate = value => {
  if (value === undefined || value === null || value === '') return null
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? undefined : date
}
function nonNegative(value, label) {
  const number = Number(value ?? 0)
  if (!Number.isFinite(number) || number < 0) throw new Error(`${label} must be a valid non-negative number.`)
  return number
}
function values(body = {}) {
  const code = String(body.code || '').trim().toUpperCase()
  const discountType = ['FIXED', 'PERCENTAGE'].includes(body.discountType) ? body.discountType : ''
  const discountValue = nonNegative(body.discountValue, 'Discount value')
  const minimumOrder = nonNegative(body.minimumOrder, 'Minimum order')
  const maximumDiscount = nonNegative(body.maximumDiscount, 'Maximum discount')
  const usageLimit = nonNegative(body.usageLimit, 'Usage limit')
  const validFromInput = asDate(body.validFrom)
  const validUntil = asDate(body.validUntil)
  // Admin uses a date input. Treat its selected end date as inclusive rather
  // than unexpectedly expiring the coupon at the start of that day.
  if (validUntil && /^\d{4}-\d{2}-\d{2}$/.test(String(body.validUntil))) validUntil.setHours(23, 59, 59, 999)
  const validFrom = validFromInput || new Date()
  if (!code || !discountType || discountValue <= 0 || (discountType === 'PERCENTAGE' && discountValue > 100) || validFromInput === undefined || validUntil === undefined || (validUntil && validUntil < validFrom)) throw new Error('Enter valid coupon details. The end date must be after the start date.')
  return { code, discountType, discountValue, customerEligibility: body.customerEligibility === 'NEW_CUSTOMER_ONLY' ? 'NEW_CUSTOMER_ONLY' : 'ALL_CUSTOMERS', minimumOrder, maximumDiscount, validFrom, validUntil, usageLimit: Math.floor(usageLimit), showToCustomers: body.showToCustomers === true, active: body.active !== false }
}
export async function couponDiscount({ code, mobile, subtotal }) { if (!code) return { coupon: null, couponCode: '', discountAmount: 0 }; const coupon = await Coupon.findOne({ code: String(code).trim().toUpperCase() }); const now = new Date(); if (!coupon || !coupon.active || coupon.validFrom > now || (coupon.validUntil && coupon.validUntil < now)) throw new Error('This coupon is invalid, inactive, or expired.'); if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) throw new Error('This coupon has reached its usage limit.'); if (subtotal < coupon.minimumOrder) throw new Error(`This coupon requires a minimum order of ₹${coupon.minimumOrder}.`); if (coupon.customerEligibility === 'NEW_CUSTOMER_ONLY') { const customerIds = await Customer.find({ mobile: String(mobile || '').trim() }).distinct('_id'); if (customerIds.length && await Booking.exists({ customer: { $in: customerIds } })) throw new Error('This coupon is for new customers only.'); } let amount = coupon.discountType === 'PERCENTAGE' ? subtotal * coupon.discountValue / 100 : coupon.discountValue; if (coupon.maximumDiscount > 0) amount = Math.min(amount, coupon.maximumDiscount); return { coupon, couponCode: coupon.code, discountAmount: Math.min(subtotal, Number(amount.toFixed(2))) } }
export async function validateCoupon(request, response, next) { try { const subtotal = Number(request.body.subtotal); if (!Number.isFinite(subtotal) || subtotal < 0) return response.status(400).json({ success: false, message: 'Invalid order total.' }); const result = await couponDiscount({ code: request.body.code, mobile: request.body.mobile, subtotal }); response.json({ success: true, data: { couponCode: result.couponCode, discountAmount: result.discountAmount, discountType: result.coupon?.discountType, discountValue: result.coupon?.discountValue } }) } catch (error) { response.status(400).json({ success: false, message: error.message || 'Unable to apply coupon.' }) } }
export async function listCustomerCoupons(_request, response, next) { try { const now = new Date(); const coupons = await Coupon.find({ active: true, showToCustomers: true, validFrom: { $lte: now }, $or: [{ validUntil: null }, { validUntil: { $gte: now } }] }).sort({ createdAt: -1 }).select('code discountType discountValue customerEligibility minimumOrder maximumDiscount validUntil usageLimit usageCount'); response.json({ success: true, data: coupons.filter(coupon => !coupon.usageLimit || coupon.usageCount < coupon.usageLimit) }) } catch (error) { next(error) } }
export async function listCoupons(_request, response, next) { try { response.json({ success: true, data: await Coupon.find().sort({ createdAt: -1 }) }) } catch (error) { next(error) } }
export async function createCoupon(request, response, next) { try { response.status(201).json({ success: true, data: await Coupon.create(values(request.body)) }) } catch (error) { response.status(400).json({ success: false, message: error.code === 11000 ? 'Coupon code already exists.' : error.message || 'Unable to create coupon.' }) } }
export async function updateCoupon(request, response, next) { try { const data = await Coupon.findByIdAndUpdate(request.params.id, values(request.body), { new: true, runValidators: true }); if (!data) return response.status(404).json({ success: false, message: 'Coupon not found.' }); response.json({ success: true, data }) } catch (error) { response.status(400).json({ success: false, message: error.code === 11000 ? 'Coupon code already exists.' : error.message || 'Unable to update coupon.' }) } }
export async function toggleCoupon(request, response, next) { try { const data = await Coupon.findByIdAndUpdate(request.params.id, { active: request.body.active !== false }, { new: true }); if (!data) return response.status(404).json({ success: false, message: 'Coupon not found.' }); response.json({ success: true, data }) } catch (error) { next(error) } }
export async function ensureInitialCoupon() { await Coupon.updateOne({ code: 'NEWLABNIVO' }, { $setOnInsert: { code: 'NEWLABNIVO', discountType: 'PERCENTAGE', discountValue: 15, customerEligibility: 'NEW_CUSTOMER_ONLY', minimumOrder: 0, maximumDiscount: 0, validFrom: new Date(), usageLimit: 0, usageCount: 0, active: true } }, { upsert: true }) }
