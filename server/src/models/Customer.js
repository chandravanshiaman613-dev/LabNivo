import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  mobile: { type: String, required: true, trim: true, match: /^\d{10}$/ },
  alternateMobile: { type: String, trim: true, default: '', match: /^(?:\d{10})?$/ },
  age: { type: Number, min: 1, max: 120 },
  gender: { type: String, enum: ['', 'male', 'female', 'other'], default: '' },
  address: { type: String, required: true, trim: true, maxlength: 300 },
  village: { type: String, trim: true, default: '', maxlength: 120 },
  area: { type: String, trim: true, default: '', maxlength: 120 },
  city: { type: String, required: true, trim: true, maxlength: 120 },
  district: { type: String, trim: true, default: '', maxlength: 120 },
  state: { type: String, trim: true, default: '', maxlength: 120 },
  pincode: { type: String, required: true, trim: true, match: /^\d{6}$/ },
  landmark: { type: String, trim: true, default: '', maxlength: 200 }
}, { timestamps: true })

export default mongoose.model('Customer', customerSchema)
