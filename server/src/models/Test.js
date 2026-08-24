import mongoose from 'mongoose'

const testSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true, maxlength: 120 },
  slug: { type: String, required: true, trim: true, unique: true, lowercase: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  category: { type: String, required: true, trim: true, index: true },
  shortDescription: { type: String, required: true, trim: true, maxlength: 280 },
  sampleType: { type: String, required: true, trim: true },
  preparation: { type: String, required: true, trim: true },
  fastingRequired: { type: Boolean, default: false },
  reportTAT: { type: String, required: true, trim: true },
  imageUrl: { type: String, trim: true, default: '' },
  homeCollection: { type: Boolean, default: true },
  mrp: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, required: true, min: 0, max: 100 },
  sellingPrice: { type: Number, required: true, min: 0 },
  partnerLabCost: { type: Number, required: true, min: 0, select: false },
  collectionCost: { type: Number, required: true, min: 0, select: false },
  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true }
}, { timestamps: true })

export default mongoose.model('Test', testSchema)
