import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { createBooking } from '../../services/bookingService'
import { validateCoupon } from '../../services/couponService'
import { money } from '../../utils/catalogue'
import { lookupPincode } from '../../services/locationService'
import { whatsappLink } from '../../config/business'
import { getSelectedCity, isServiceableCity, serviceabilityMessage } from '../../config/serviceability'
import './Booking.css'

const slots = ['7:00 AM - 9:00 AM', '9:00 AM - 11:00 AM', '11:00 AM - 1:00 PM', '4:00 PM - 6:00 PM']
const steps = ['Patient', 'Address', 'Slot', 'Review']
const initial = { name:'', age:'', gender:'', mobile:'', alternateMobile:'', address:'', area:'', city:'', district:'', state:'', pincode:'', landmark:'', preferredDate:'', preferredTimeSlot:'', notes:'' }

export default function Booking() {
  const { items } = useCart(); const navigate = useNavigate()
  const [form, setForm] = useState(() => ({ ...initial, city: getSelectedCity() }))
  const [step, setStep] = useState(1), [error, setError] = useState(''), [submitting, setSubmitting] = useState(false)
  const [couponInput, setCouponInput] = useState(''), [coupon, setCoupon] = useState(null), [couponBusy, setCouponBusy] = useState(false)
  const estimated = items.reduce((total, item) => total + (item.price || item.sellingPrice || 0), 0)
  const discount = coupon?.discountAmount || 0
  const finalTotal = Math.max(0, estimated - discount)
  const update = async event => {
    const { name } = event.target
    const value = ['mobile','alternateMobile','pincode'].includes(name) ? event.target.value.replace(/\D/g, '') : event.target.value
    setForm(current => ({ ...current, [name]: value }))
    if (name === 'pincode' && /^\d{6}$/.test(value)) { try { const location = await lookupPincode(value); if (location) setForm(current => ({ ...current, ...location })) } catch {} }
  }
  const next = () => {
    setError('')
    if (step === 1 && (!form.name || !/^\d{10}$/.test(form.mobile))) return setError('Enter the patient name and a valid 10-digit mobile number.')
    if (step === 2 && (!form.address || !form.city || !/^\d{6}$/.test(form.pincode))) return setError('Enter the address, city and a valid 6-digit pincode.')
    if (step === 2 && !isServiceableCity(form.city)) return setError(serviceabilityMessage)
    if (step === 3 && (!form.preferredDate || !form.preferredTimeSlot)) return setError('Choose a collection date and time slot.')
    setStep(current => Math.min(4, current + 1))
  }
  async function applyCoupon() {
    setError('')
    if (!/^\d{10}$/.test(form.mobile)) return setError('Enter your 10-digit mobile number before applying a coupon.')
    setCouponBusy(true)
    try { setCoupon(await validateCoupon({ code: couponInput, mobile: form.mobile, subtotal: estimated })) }
    catch (requestError) { setCoupon(null); setError(requestError.response?.data?.message || 'Unable to apply coupon.') }
    finally { setCouponBusy(false) }
  }
  async function submit(event) {
    event.preventDefault(); setError('')
    if (!items.length) return setError('Add at least one test or package before confirming.')
    setSubmitting(true)
    try {
      const booking = await createBooking({ customer:{ ...form, age:Number(form.age) || undefined }, items:items.map(item => ({ type:item.type || (item.includedTests ? 'PACKAGE' : 'TEST'), reference:item.reference || item._id, quantity:1 })), preferredDate:form.preferredDate, preferredTimeSlot:form.preferredTimeSlot, notes:form.notes, couponCode:coupon?.couponCode || '', paymentMethod:'PAY_AT_COLLECTION' })
      navigate(`/booking-success/${booking.bookingId}`, { state:{ booking } })
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to create booking. Please try again.') }
    finally { setSubmitting(false) }
  }
  if (!items.length) return <main className="booking-page"><span className="overline">BOOKING</span><h1>Your cart is empty</h1><p>Add a test or package to begin your booking.</p><Link className="button button-primary" to="/tests">Browse tests</Link></main>
  return <main className="booking-page"><span className="overline">HOME COLLECTION</span><h1>Book Your Test</h1><div className="booking-steps">{steps.map((label, index) => <button type="button" key={label} className={step === index + 1 ? 'active' : step > index + 1 ? 'done' : ''} onClick={() => index + 1 < step && setStep(index + 1)}><b>{index + 1}</b><span>{label}</span></button>)}</div><div className="booking-layout"><form className="booking-form" onSubmit={submit}>
    {step === 1 && <section><h2>Patient Details</h2><div className="form-grid"><label className="wide">Full Name*<input name="name" value={form.name} onChange={update} placeholder="Enter patient name"/></label><label>Age<input name="age" type="number" min="1" max="120" value={form.age} onChange={update} placeholder="Enter age"/></label><label>Gender<select name="gender" value={form.gender} onChange={update}><option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label><label className="wide">Mobile Number*<input name="mobile" inputMode="numeric" maxLength="10" value={form.mobile} onChange={update} placeholder="Enter 10-digit mobile number"/></label><label className="wide">Alternate Mobile <small>(optional)</small><input name="alternateMobile" inputMode="numeric" maxLength="10" value={form.alternateMobile} onChange={update} placeholder="Enter alternate mobile number"/></label></div></section>}
    {step === 2 && <section><h2>Address Details</h2><div className="form-grid"><label className="wide">Address / Street*<input name="address" value={form.address} onChange={update} placeholder="Enter address"/></label><label>City*<input name="city" value={form.city} onChange={update} placeholder="Indore or Bhopal"/></label><label>State<input name="state" value={form.state} onChange={update} placeholder="State"/></label><label>Pincode*<input name="pincode" inputMode="numeric" maxLength="6" value={form.pincode} onChange={update} placeholder="Enter pincode"/></label><label className="wide">Landmark <small>(optional)</small><input name="landmark" value={form.landmark} onChange={update} placeholder="Nearby landmark"/></label></div></section>}
    {step === 3 && <section><h2>Select collection slot</h2><div className="form-grid"><label className="wide">Collection Date*<input name="preferredDate" type="date" min={new Date().toISOString().slice(0,10)} value={form.preferredDate} onChange={update}/></label></div><div className="slot-list">{slots.map(slot => <label key={slot} className={form.preferredTimeSlot === slot ? 'slot selected' : 'slot'}><input type="radio" name="preferredTimeSlot" value={slot} checked={form.preferredTimeSlot === slot} onChange={update}/>{slot}</label>)}</div><label className="booking-notes">Notes <textarea name="notes" value={form.notes} onChange={update} maxLength="500" placeholder="Anything our collection team should know?"/></label></section>}
    {step === 4 && <section><h2>Payment & Review</h2><div className="review-items">{items.map(item => <div key={item.slug || item.reference}><span>{item.name}</span><b>{money(item.price || item.sellingPrice)}</b></div>)}</div><section className="payment-method"><h2>Payment Method</h2><label className="payment-option selected"><input type="radio" checked readOnly/><span><b>Pay at Collection</b><small>Pay when the collection executive visits.</small></span></label><label className="payment-option disabled"><input type="radio" disabled/><span><b>UPI</b><small>Coming soon</small></span></label></section></section>}
    {error && <p className="form-error">{error}</p>}<div className="step-actions">{step > 1 && <button type="button" className="button button-secondary" onClick={() => setStep(current => current - 1)}>Back</button>}{step < 4 ? <button type="button" className="button button-primary" onClick={next}>Next</button> : <button className="button button-primary" disabled={submitting}>{submitting ? 'Confirming booking...' : 'Confirm Booking'}</button>}</div>
  </form><aside className="price-summary"><h2>Your selected tests</h2>{items.map(item => <div className="summary-item" key={item.slug || item.reference}><b>{item.name}</b><span>MRP {money(item.mrp)}</span><strong>{money(item.price || item.sellingPrice)}</strong></div>)}<section className="coupon-box"><b>Have a coupon code?</b>{coupon ? <><p className="coupon-applied">✓ {coupon.couponCode} applied<br/>You saved {money(discount)}</p><button type="button" className="text-button" onClick={() => { setCoupon(null); setCouponInput('') }}>Remove coupon</button></> : <div><input placeholder="Enter code" value={couponInput} onChange={event => setCouponInput(event.target.value.toUpperCase())}/><button type="button" className="button button-primary" onClick={applyCoupon} disabled={couponBusy}>{couponBusy ? 'Applying...' : 'Apply'}</button></div>}</section><div className="summary-row"><span>Subtotal</span><span>{money(estimated)}</span></div><div className="summary-row"><span>Coupon Discount</span><span>-{money(discount)}</span></div><div className="summary-row"><span>Collection Charge</span><span>{money(0)}</span></div><div className="summary-total"><span>Final Amount</span><b>{money(finalTotal)}</b></div></aside></div></main>
}
