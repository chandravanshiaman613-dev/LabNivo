import mongoose from 'mongoose'

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true, maxlength: 120 },
  slug: { type: String, required: true, trim: true, unique: true, lowercase: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  description: { type: String, required: true, trim: true, maxlength: 400 },
  includedTests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true }],
  mrp: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, required: true, min: 0, max: 100 },
  sellingPrice: { type: Number, required: true, min: 0 },
  preparation: { type: String, required: true, trim: true },
  reportTAT: { type: String, required: true, trim: true },
  imageUrl: { type: String, trim: true, default: '' },
  featured: { type: Boolean, default: false, index: true },
  displayOrder: { type: Number, default: 0, min: 0, index: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true }
}, { timestamps: true })

export default mongoose.model('Package', packageSchema)
