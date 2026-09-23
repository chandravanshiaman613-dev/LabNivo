import mongoose from 'mongoose'

const bannerSchema = new mongoose.Schema({
  type: { type: String, enum: ['TEXT', 'IMAGE'], required: true, default: 'TEXT' },
  label: { type: String, trim: true, maxlength: 80, default: '' },
  title: { type: String, trim: true, maxlength: 120, default: '' },
  description: { type: String, trim: true, maxlength: 240, default: '' },
  buttonText: { type: String, trim: true, maxlength: 40, default: '' },
  buttonLink: { type: String, trim: true, maxlength: 200, default: '' },
  imageUrl: { type: String, trim: true, default: '' },
  active: { type: Boolean, default: true, index: true },
  displayOrder: { type: Number, default: 1, min: 0, index: true }
}, { timestamps: true })

export default mongoose.model('Banner', bannerSchema)
