import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 40 },
  discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  customerEligibility: { type: String, enum: ['ALL_CUSTOMERS', 'NEW_CUSTOMER_ONLY'], default: 'ALL_CUSTOMERS', required: true },
  minimumOrder: { type: Number, min: 0, default: 0 },
  maximumDiscount: { type: Number, min: 0, default: 0 },
  validFrom: { type: Date, default: Date.now, required: true },
  validUntil: { type: Date, default: null },
  usageLimit: { type: Number, min: 0, default: 0 },
  usageCount: { type: Number, min: 0, default: 0 },
  // This deliberately defaults to false so existing coupons do not become
  // customer-facing until an administrator explicitly opts in.
  showToCustomers: { type: Boolean, default: false, index: true },
  active: { type: Boolean, default: true, index: true }
}, { timestamps: true })

export default mongoose.model('Coupon', couponSchema)
