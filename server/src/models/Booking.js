import mongoose from 'mongoose'

export const BOOKING_STATUSES = ['NEW_BOOKING', 'CONFIRMED', 'COLLECTOR_ASSIGNED', 'COLLECTION_SCHEDULED', 'SAMPLE_COLLECTED', 'SAMPLE_IN_TRANSIT', 'SAMPLE_RECEIVED', 'TESTING_IN_PROGRESS', 'REPORT_RECEIVED', 'REPORT_DELIVERED', 'COMPLETED', 'CANCELLED']

const bookingItemSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['TEST', 'PACKAGE'] },
  reference: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'typeModel' },
  typeModel: { type: String, required: true, enum: ['Test', 'Package'] },
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  mrp: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, required: true, min: 0, max: 100 },
  sellingPrice: { type: Number, required: true, min: 0 }
}, { _id: false })

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: { type: [bookingItemSchema], required: true, validate: value => value.length > 0 },
  totalMRP: { type: Number, required: true, min: 0 },
  totalDiscount: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0, default: 0 },
  couponCode: { type: String, trim: true, uppercase: true, default: '' },
  discountAmount: { type: Number, required: true, min: 0, default: 0 },
  collectionCharge: { type: Number, required: true, min: 0, default: 0 },
  address: { type: String, required: true, trim: true },
  preferredDate: { type: Date, required: true },
  preferredTimeSlot: { type: String, required: true, trim: true },
  notes: { type: String, trim: true, default: '', maxlength: 500 },
  quotationId: { type: String, default: '', index: true },
  prescriptionLeadId: { type: String, default: '', index: true },
  paymentMethod: { type: String, enum: ['PAY_AT_COLLECTION'], default: 'PAY_AT_COLLECTION', required: true },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED'], default: 'PENDING', required: true },
  status: { type: String, enum: BOOKING_STATUSES, default: 'NEW_BOOKING', index: true }
}, { timestamps: true })

export default mongoose.model('Booking', bookingSchema)
