import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { createBooking } from '../../services/bookingService'
import { getCustomerCoupons, validateCoupon } from '../../services/couponService'
import { money } from '../../utils/catalogue'
import { lookupPincode, reverseGeocodeLocation } from '../../services/locationService'
import { getSelectedCity, isServiceableCity, serviceabilityMessage } from '../../config/serviceability'
import './Booking.css'

const slots = ['7:00 AM - 9:00 AM', '9:00 AM - 11:00 AM', '11:00 AM - 1:00 PM', '4:00 PM - 6:00 PM']
const steps = ['Patient', 'Address', 'Slot', 'Review']
const initial = { name:'', age:'', gender:'', mobile:'', alternateMobile:'', address:'', area:'', city:'', district:'', state:'', pincode:'', landmark:'', preferredDate:'', preferredTimeSlot:'', notes:'' }

function Offer({ offer, onApply, busy }) {
  const value = offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}% OFF` : `${money(offer.discountValue)} OFF`
  return <article className="coupon-offer"><div><b>{offer.code}</b><span>{value} · {offer.customerEligibility === 'NEW_CUSTOMER_ONLY' ? 'New customers only' : 'All customers'}</span>{offer.minimumOrder > 0 && <small>Min. order {money(offer.minimumOrder)}</small>}{offer.maximumDiscount > 0 && <small>Up to {money(offer.maximumDiscount)} discount</small>}</div><button type="button" className="button button-secondary" disabled={busy} onClick={() => onApply(offer.code)}>Apply</button></article>
}

export default function Booking() {
  const { items } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState(() => ({ ...initial, city: getSelectedCity() }))
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponBusy, setCouponBusy] = useState(false)
  const [offers, setOffers] = useState([])
  const [offersError, setOffersError] = useState('')
  const [fetchingLocation, setFetchingLocation] = useState(false)
  const [locationMessage, setLocationMessage] = useState('')
  const submitLock = useRef(false)
  const subtotal = items.reduce((total, item) => total + (item.price || item.sellingPrice || 0), 0)
  const discount = coupon?.discountAmount || 0

  useEffect(() => {
    if (step !== 4) return undefined
    let active = true
    getCustomerCoupons().then(data => { if (active) setOffers(data) }).catch(() => { if (active) setOffersError('Available offers could not be loaded. You can still enter a coupon code.') })
    return () => { active = false }
  }, [step])

  const update = async event => {
    const { name } = event.target
    const value = ['mobile', 'alternateMobile', 'pincode'].includes(name) ? event.target.value.replace(/\D/g, '') : event.target.value
    setForm(current => ({ ...current, [name]: value }))
    if (name === 'pincode' && /^\d{6}$/.test(value)) {
      try { const location = await lookupPincode(value); if (location) setForm(current => ({ ...current, ...location })) } catch { /* Optional lookup. */ }
    }
  }
  const goToReview = () => {
    setError('')
    if (step === 1 && (!form.name || !/^\d{10}$/.test(form.mobile))) return setError('Enter the patient name and a valid 10-digit mobile number.')
    if (step === 2 && (!form.address || !form.city || !/^\d{6}$/.test(form.pincode))) return setError('Enter the address, city and a valid 6-digit pincode.')
    if (step === 2 && !isServiceableCity(form.city)) return setError(serviceabilityMessage)
    if (step === 3 && (!form.preferredDate || !form.preferredTimeSlot)) return setError('Choose a collection date and time slot.')
    setStep(current => Math.min(4, current + 1))
  }
  function fetchMyLocation() {
    if (!navigator.geolocation) {
      setLocationMessage('Location is not supported by this browser. Please enter your address manually.')
      return
    }
    setFetchingLocation(true)
    setLocationMessage('Fetching your location...')
    navigator.geolocation.getCurrentPosition(async position => {
      try {
        const location = await reverseGeocodeLocation(position.coords.latitude, position.coords.longitude)
        setForm(current => ({
          ...current,
          address: current.address || location.address,
          city: current.city || location.city,
          district: current.district || location.district,
          state: current.state || location.state,
          pincode: current.pincode || location.pincode,
          landmark: current.landmark || location.landmark
        }))
        setLocationMessage(location.city && !isServiceableCity(location.city) ? serviceabilityMessage : 'Location details added where available. Please review your address.')
      } catch {
        setLocationMessage('Unable to fetch your location. Please enter your address manually.')
      } finally {
        setFetchingLocation(false)
      }
    }, positionError => {
      const denied = positionError.code === positionError.PERMISSION_DENIED
      setLocationMessage(denied ? 'Location permission was denied. Please enter your address manually.' : 'Unable to fetch your location. Please enter your address manually.')
      setFetchingLocation(false)
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 })
  }
  async function applyCoupon(code = couponInput) {
    setError('')
    if (!/^\d{10}$/.test(form.mobile)) return setError('Enter your 10-digit mobile number before applying a coupon.')
    setCouponBusy(true)
    try { const applied = await validateCoupon({ code, mobile: form.mobile, subtotal }); setCoupon(applied); setCouponInput(applied.couponCode) }
    catch (requestError) { setCoupon(null); setError(requestError.response?.data?.message || 'Unable to apply coupon.') }
    finally { setCouponBusy(false) }
  }
  async function confirmBooking() {
    if (submitLock.current || submitting) return
    setError('')
    if (!items.length) return setError('Add at least one test or package before confirming.')
    submitLock.current = true
    setSubmitting(true)
    try {
      const booking = await createBooking({ customer:{ ...form, age:Number(form.age) || undefined }, items:items.map(item => ({ type:item.type || (item.includedTests ? 'PACKAGE' : 'TEST'), reference:item.reference || item._id, quantity:1 })), preferredDate:form.preferredDate, preferredTimeSlot:form.preferredTimeSlot, notes:form.notes, couponCode:coupon?.couponCode || '', paymentMethod:'PAY_AT_COLLECTION' })
      navigate(`/booking-success/${booking.bookingId}`, { state:{ booking } })
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to create booking. Please try again.'); submitLock.current = false }
    finally { setSubmitting(false) }
  }

  if (!items.length) return <main className="booking-page"><span className="overline">BOOKING</span><h1>Your cart is empty</h1><p>Add a test or package to begin your booking.</p><Link className="button button-primary" to="/tests">Browse tests</Link></main>
  const actions = <div className="step-actions">{step > 1 && <button type="button" className="button button-secondary" onClick={() => setStep(current => current - 1)}>Back</button>}{step < 4 ? <button type="button" className="button button-primary" onClick={goToReview}>Next</button> : <button type="button" className="button button-primary" onClick={confirmBooking} disabled={submitting}>{submitting ? 'Confirming booking...' : 'Confirm Booking'}</button>}</div>
  return <main className="booking-page"><span className="overline">HOME COLLECTION</span><h1>Book Your Test</h1><div className="booking-steps">{steps.map((label, index) => <button type="button" key={label} className={step === index + 1 ? 'active' : step > index + 1 ? 'done' : ''} onClick={() => index + 1 < step && setStep(index + 1)}><b>{index + 1}</b><span>{label}</span></button>)}</div><div className="booking-layout"><div className="booking-form">
    {step === 1 && <section><h2>Patient Details</h2><div className="form-grid"><label className="wide">Patient Name*<input name="name" value={form.name} onChange={update}/></label><label>Age<input name="age" type="number" min="1" max="120" value={form.age} onChange={update}/></label><label>Gender<select name="gender" value={form.gender} onChange={update}><option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label><label className="wide">Mobile Number*<input name="mobile" inputMode="numeric" maxLength="10" value={form.mobile} onChange={update}/></label><label className="wide">Alternate Mobile Number <small>(optional)</small><input name="alternateMobile" inputMode="numeric" maxLength="10" value={form.alternateMobile} onChange={update}/></label></div></section>}
    {step === 2 && <section><h2>Address Details</h2><div className="location-fetch"><button type="button" className="button button-secondary" disabled={fetchingLocation} onClick={fetchMyLocation}>{fetchingLocation ? 'Fetching your location...' : '📍 Fetch My Location'}</button>{locationMessage && <p className={locationMessage === serviceabilityMessage ? 'form-error' : 'location-note'}>{locationMessage}</p>}</div><div className="form-grid"><label className="wide">Address / Street*<input name="address" value={form.address} onChange={update}/></label><label>City*<input name="city" value={form.city} onChange={update}/></label><label>State<input name="state" value={form.state} onChange={update}/></label><label>Pincode*<input name="pincode" inputMode="numeric" maxLength="6" value={form.pincode} onChange={update}/></label><label className="wide">Landmark <small>(optional)</small><input name="landmark" value={form.landmark} onChange={update}/></label></div></section>}
    {step === 3 && <section><h2>Select collection slot</h2><div className="form-grid"><label className="wide">Collection Date*<input name="preferredDate" type="date" min={new Date().toISOString().slice(0, 10)} value={form.preferredDate} onChange={update}/></label></div><div className="slot-list">{slots.map(slot => <label key={slot} className={form.preferredTimeSlot === slot ? 'slot selected' : 'slot'}><input type="radio" name="preferredTimeSlot" value={slot} checked={form.preferredTimeSlot === slot} onChange={update}/>{slot}</label>)}</div><label className="booking-notes">Notes<textarea name="notes" value={form.notes} onChange={update} maxLength="500"/></label></section>}
    {step === 4 && <section className="review-section"><h2>Review your booking</h2><div className="review-detail"><b>Patient Details</b><span>{form.name} · {form.age || 'Age not provided'} · {form.gender || 'Gender not provided'}<br/>{form.mobile}{form.alternateMobile ? ` · ${form.alternateMobile}` : ''}</span></div><div className="review-detail"><b>Address</b><span>{[form.address, form.city, form.state, form.pincode, form.landmark].filter(Boolean).join(', ')}</span></div><div className="review-detail"><b>Date & Time</b><span>{form.preferredDate} · {form.preferredTimeSlot}</span></div><div className="review-items"><b>Selected Tests / Package</b>{items.map(item => <div key={item.slug || item.reference}><span>{item.name}</span><strong>{money(item.price || item.sellingPrice)}</strong></div>)}</div><section className="coupon-box"><h3>Coupon / Available Offers</h3>{offersError && <p className="coupon-note">{offersError}</p>}{offers.map(offer => <Offer key={offer._id} offer={offer} busy={couponBusy} onApply={applyCoupon}/>)}{coupon ? <><p className="coupon-applied">✓ {coupon.couponCode} applied — you saved {money(discount)}</p><button type="button" className="text-button" onClick={() => { setCoupon(null); setCouponInput('') }}>Remove coupon</button></> : <div className="coupon-entry"><input placeholder="Enter coupon code" value={couponInput} onChange={event => setCouponInput(event.target.value.toUpperCase())}/><button type="button" className="button button-primary" onClick={() => applyCoupon()} disabled={couponBusy}>{couponBusy ? 'Applying...' : 'Apply'}</button></div>}</section><section className="payment-method"><h3>Payment Method</h3><label className="payment-option selected"><input type="radio" checked readOnly/><span><b>Pay at Collection</b><small>Pay when the collection executive visits.</small></span></label></section></section>}
    {error && <p className="form-error">{error}</p>}{actions}</div>{step === 4 && <aside className="price-summary"><h2>Price Summary</h2><div className="summary-row"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="summary-row"><span>Coupon Discount</span><span>-{money(discount)}</span></div><div className="summary-row"><span>Collection Charge</span><span>{money(0)}</span></div><div className="summary-total"><span>Final Amount</span><b>{money(Math.max(0, subtotal - discount))}</b></div></aside>}</div></main>
}
