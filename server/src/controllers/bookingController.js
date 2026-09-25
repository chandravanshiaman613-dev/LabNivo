import mongoose from 'mongoose'
import Booking, { BOOKING_STATUSES, CUSTOMER_BOOKING_STATUSES, friendlyBookingStatus } from '../models/Booking.js'
import Customer from '../models/Customer.js'
import Coupon from '../models/Coupon.js'
import Package from '../models/Package.js'
import Test from '../models/Test.js'
import { couponDiscount } from './couponController.js'

const TIME_SLOTS = ['7:00 AM - 9:00 AM', '9:00 AM - 11:00 AM', '11:00 AM - 1:00 PM', '4:00 PM - 6:00 PM']
const ONLINE_SERVICEABLE_CITIES = ['indore', 'bhopal']
const ADMIN_EDITABLE_STATUSES = CUSTOMER_BOOKING_STATUSES
const customerFields = ['name', 'mobile', 'alternateMobile', 'age', 'gender', 'address', 'area', 'city', 'district', 'state', 'pincode', 'landmark']

function cleanCustomer(input = {}) { return Object.fromEntries(customerFields.map(key => [key, key === 'gender' && !input[key] ? undefined : typeof input[key] === 'string' ? input[key].trim() : input[key]])) }
function isValidDate(value) { const date = new Date(value); const today = new Date(); today.setHours(0, 0, 0, 0); return !Number.isNaN(date.valueOf()) && date >= today }
function publicBooking(booking) { return { bookingId: booking.bookingId, customer: booking.customer ? { name: booking.customer.name, mobile: booking.customer.mobile, alternateMobile: booking.customer.alternateMobile, age: booking.customer.age, gender: booking.customer.gender, address: booking.customer.address, city: booking.customer.city, district: booking.customer.district, state: booking.customer.state, pincode: booking.customer.pincode, landmark: booking.customer.landmark } : null, items: booking.items.map(item => ({ name: item.name, quantity: item.quantity, sellingPrice: item.sellingPrice, person2: item.person2, coupleDiscount: item.coupleDiscount || 0 })), subtotal: booking.subtotal ?? booking.totalAmount, couponCode: booking.couponCode || '', discountAmount: booking.discountAmount || 0, coupleDiscount: booking.coupleDiscount || 0, totalAmount: booking.totalAmount, finalAmount: booking.totalAmount, collectionCharge: booking.collectionCharge, preferredDate: booking.preferredDate, preferredTimeSlot: booking.preferredTimeSlot, paymentMethod: booking.paymentMethod || 'PAY_AT_COLLECTION', paymentStatus: booking.paymentStatus || 'PENDING', status: friendlyBookingStatus(booking.status) } }
function adminBooking(booking) { return { ...(booking.toObject ? booking.toObject() : booking), status: friendlyBookingStatus(booking.status) } }
async function nextBookingId() { const result = await mongoose.connection.collection('counters').findOneAndUpdate({ _id: 'bookingId' }, [{ $set: { sequence: { $add: [{ $ifNull: ['$sequence', 10000] }, 1] } } }], { upsert: true, returnDocument: 'after' }); const sequence = result?.value?.sequence ?? result.sequence; return `LN-B-${sequence}` }

export async function createBooking(request, response, next) {
  try {
    const { items, customer: customerInput, preferredDate, preferredTimeSlot, notes = '', couponCode = '' } = request.body
    const customerData = cleanCustomer(customerInput)
    if (!Array.isArray(items) || !items.length) return response.status(400).json({ success: false, message: 'Add at least one test or package to continue.' })
    if (!customerData.name || !/^\d{10}$/.test(customerData.mobile || '') || !customerData.address || !customerData.city || !/^\d{6}$/.test(customerData.pincode || '')) return response.status(400).json({ success: false, message: 'Please fill all required customer details correctly.' })
    if (customerData.age && (!Number.isInteger(Number(customerData.age)) || Number(customerData.age) < 1 || Number(customerData.age) > 120)) return response.status(400).json({ success: false, message: 'Enter a valid age.' })
    if (customerData.gender && !['male', 'female', 'other'].includes(customerData.gender)) return response.status(400).json({ success: false, message: 'Enter a valid gender.' })
    if (customerData.alternateMobile && !/^\d{10}$/.test(customerData.alternateMobile)) return response.status(400).json({ success: false, message: 'Enter a valid alternate mobile number.' })
    if (!ONLINE_SERVICEABLE_CITIES.includes(String(customerData.city || '').trim().toLowerCase())) return response.status(400).json({ success: false, message: 'Online home sample collection is currently available only in Indore and Bhopal.' })
    if (!isValidDate(preferredDate) || !TIME_SLOTS.includes(preferredTimeSlot)) return response.status(400).json({ success: false, message: 'Choose a valid future collection date and time slot.' })
    const uniqueItems = new Map()
    for (const item of items) { if (!['TEST', 'PACKAGE'].includes(item.type) || !mongoose.isValidObjectId(item.reference)) return response.status(400).json({ success: false, message: 'One or more selected items are invalid.' }); const key = `${item.type}:${item.reference}`; uniqueItems.set(key, { type: item.type, reference: item.reference, quantity: 1, person2: item.person2 }) }
    const snapshots = []
    for (const item of uniqueItems.values()) { const Model = item.type === 'TEST' ? Test : Package; const record = await Model.findOne({ _id: item.reference, status: 'active' }); if (!record) return response.status(400).json({ success: false, message: 'A selected test or package is no longer available.' }); if (item.person2 && item.type !== 'PACKAGE') return response.status(400).json({ success: false, message: 'Add Another Person is available for packages only.' }); if (item.person2 && (!String(item.person2.name || '').trim() || !Number.isInteger(Number(item.person2.age)) || Number(item.person2.age)<1 || Number(item.person2.age)>120 || !['male','female','other'].includes(item.person2.gender))) return response.status(400).json({ success: false, message: 'Enter valid name, age and gender for Person 2.' }); const secondDiscount = item.person2 ? Math.min(100, record.sellingPrice) : 0; snapshots.push({ type: item.type, typeModel: item.type === 'TEST' ? 'Test' : 'Package', reference: record._id, name: record.name, quantity: item.person2 ? 2 : 1, mrp: record.mrp, discountPercent: record.discountPercent, sellingPrice: record.sellingPrice, ...(item.person2 ? { person2: { name: String(item.person2.name).trim(), age: Number(item.person2.age), gender: item.person2.gender }, coupleDiscount: secondDiscount } : { coupleDiscount: 0 }) }) }
    const totalMRP = snapshots.reduce((sum, item) => sum + item.mrp * item.quantity, 0)
    const subtotal = snapshots.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0)
    const coupleDiscount = snapshots.reduce((sum, item) => sum + (item.coupleDiscount || 0), 0)
    const collectionCharge = Math.max(0, Number(process.env.COLLECTION_CHARGE ?? 0))
    let coupon
    try { coupon = await couponDiscount({ code: couponCode, mobile: customerData.mobile, subtotal }) } catch (error) { return response.status(400).json({ success: false, message: error.message }) }
    const customer = await Customer.create(customerData)
    const finalAmount = Math.max(0, subtotal - coupleDiscount - coupon.discountAmount + collectionCharge)
    const booking = await Booking.create({ bookingId: await nextBookingId(), customer: customer._id, items: snapshots, totalMRP, totalDiscount: totalMRP - subtotal, subtotal, coupleDiscount, couponCode: coupon.couponCode, discountAmount: coupon.discountAmount, totalAmount: finalAmount, collectionCharge, address: [customerData.address, customerData.area, customerData.city, customerData.district, customerData.state, customerData.pincode].filter(Boolean).join(', '), preferredDate, preferredTimeSlot, notes: String(notes).trim().slice(0, 500), paymentMethod: 'PAY_AT_COLLECTION', paymentStatus: 'PENDING' })
    if (coupon.coupon) await Coupon.updateOne({ _id: coupon.coupon._id, ...(coupon.coupon.usageLimit > 0 ? { usageCount: { $lt: coupon.coupon.usageLimit } } : {}) }, { $inc: { usageCount: 1 } })
    booking.customer = customer
    response.status(201).json({ success: true, data: publicBooking(booking) })
  } catch (error) { next(error) }
}

export async function getBookingForTracking(request, response, next) { try { const mobile = String(request.query.mobile || '').trim(); if (!/^\d{10}$/.test(mobile)) return response.status(400).json({ success: false, message: 'Enter a valid booking ID and mobile number.' }); const booking = await Booking.findOne({ bookingId: request.params.bookingId.toUpperCase() }).populate('customer'); if (!booking || booking.customer.mobile !== mobile) return response.status(404).json({ success: false, message: 'Booking not found. Check your booking ID and mobile number.' }); response.json({ success: true, data: publicBooking(booking) }) } catch (error) { next(error) } }
export async function listBookingsForTracking(request, response, next) { try { const mobile = String(request.query.mobile || '').trim(); if (!/^\d{10}$/.test(mobile)) return response.status(400).json({ success: false, message: 'Enter a valid 10-digit mobile number.' }); const customers = await Customer.find({ mobile }).select('_id'); const data = await Booking.find({ customer: { $in: customers.map(customer => customer._id) } }).populate('customer').sort({ createdAt: -1 }); response.json({ success: true, data: data.map(publicBooking) }) } catch (error) { next(error) } }
export async function listMyOrders(request, response, next) { try { const data = await Booking.find().populate({ path: 'customer', match: { mobile: request.customerMobile } }).sort({ createdAt: -1 }); response.json({ success: true, data: data.filter(booking => booking.customer).map(publicBooking) }) } catch (error) { next(error) } }
export async function getMyOrder(request, response, next) { try { const data = await Booking.findOne({ bookingId: request.params.bookingId.toUpperCase() }).populate('customer'); if (!data || data.customer?.mobile !== request.customerMobile) return response.status(404).json({ success: false, message: 'Booking not found.' }); response.json({ success: true, data: { ...publicBooking(data), address: data.address, notes: data.notes } }) } catch (error) { next(error) } }
export async function listAdminBookings(_request, response, next) { try { const data = await Booking.find().populate('customer').sort({ createdAt: -1 }); response.json({ success: true, data: data.map(adminBooking) }) } catch (error) { next(error) } }
export async function getAdminBooking(request, response, next) { try { const data = await Booking.findOne({ bookingId: request.params.bookingId.toUpperCase() }).populate('customer'); if (!data) return response.status(404).json({ success: false, message: 'Booking not found' }); response.json({ success: true, data: adminBooking(data) }) } catch (error) { next(error) } }
export async function updateBookingStatus(request, response, next) { try { const { status } = request.body; if (!ADMIN_EDITABLE_STATUSES.includes(status)) return response.status(400).json({ success: false, message: 'Invalid booking status.' }); const data = await Booking.findOneAndUpdate({ bookingId: request.params.bookingId.toUpperCase() }, { status }, { new: true, runValidators: true }).populate('customer'); if (!data) return response.status(404).json({ success: false, message: 'Booking not found' }); response.json({ success: true, data: adminBooking(data) }) } catch (error) { next(error) } }
export { TIME_SLOTS, BOOKING_STATUSES, ADMIN_EDITABLE_STATUSES }
