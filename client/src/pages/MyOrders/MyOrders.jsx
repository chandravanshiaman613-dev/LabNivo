import { useEffect, useState } from 'react'
import { getBookingsByMobile } from '../../services/bookingService'
import { money } from '../../utils/catalogue'
import './MyOrders.css'

const trackingStages = ['Booking Confirmed', 'Sample Collection Scheduled', 'Sample Collected', 'Testing in Progress', 'Report Ready']

function TrackingTimeline({ status }) {
  if (status === 'Booking Cancelled') return <div className="tracking-timeline cancelled"><div className="active"><i>×</i><span>Booking Cancelled<small>This booking has been cancelled.</small></span></div></div>
  const activeIndex = Math.max(0, trackingStages.indexOf(status))
  return <div className="tracking-timeline">{trackingStages.map((stage, index) => <div className={index < activeIndex ? 'done' : index === activeIndex ? 'active' : ''} key={stage}><i>{index <= activeIndex ? '✓' : '○'}</i><span>{stage}<small>{index === activeIndex ? 'Current status' : index < activeIndex ? 'Completed' : 'Pending'}</small></span></div>)}</div>
}

export default function MyOrders() {
  const [mobile, setMobile] = useState('')
  const [trackingMobile, setTrackingMobile] = useState('')
  const [bookings, setBookings] = useState(null)
  const [booking, setBooking] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const updateMobile = value => { setMobile(value.replace(/\D/g, '').slice(0, 10)); setTrackingMobile(''); setBookings(null); setBooking(null); setError('') }
  const pasteMobile = event => { const digits = event.clipboardData.getData('text').replace(/\D/g, ''); const national = digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits; if (/^\d{10}$/.test(national)) { event.preventDefault(); updateMobile(national) } }
  useEffect(() => {
    if (!trackingMobile) return undefined
    let active = true
    const refresh = async () => {
      try {
        const updatedBookings = await getBookingsByMobile(trackingMobile)
        if (!active) return
        setBookings(updatedBookings)
        setBooking(current => current ? updatedBookings.find(item => item.bookingId === current.bookingId) || null : null)
      } catch { /* Keep the current tracking result visible until the next poll. */ }
    }
    const timer = window.setInterval(refresh, 12000)
    return () => { active = false; window.clearInterval(timer) }
  }, [trackingMobile])
  async function track(event) {
    event.preventDefault()
    if (busy) return
    setBusy(true); setError(''); setBooking(null)
    try { setBookings(await getBookingsByMobile(mobile)); setTrackingMobile(mobile) }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to find bookings for this mobile number.'); setBookings(null); setTrackingMobile('') }
    finally { setBusy(false) }
  }
  return <main className="booking-page my-orders-page"><span className="overline">TRACK BOOKING</span><h1>Track Your Booking</h1><p>Enter your registered mobile number to view your bookings.</p><section className="booking-form track-card"><form onSubmit={track}><label>Mobile Number<input required inputMode="numeric" maxLength="10" pattern="[0-9]{10}" value={mobile} onChange={event => updateMobile(event.target.value)} onPaste={pasteMobile} placeholder="Enter mobile number" /></label><button className="button button-primary" disabled={busy || mobile.length !== 10}>{busy ? 'Loading…' : 'Track Booking'}</button></form>{error && <p className="form-error">{error}</p>}</section>{bookings && (bookings.length ? <section className="booking-results"><h2>Select a booking</h2><div className="booking-list">{bookings.map(item => <button type="button" key={item.bookingId} className="booking-list-item" onClick={() => setBooking(item)}><b>{item.bookingId}</b><span>{item.customer.name}</span><span>{item.items.map(test => test.name).join(', ')}</span><small>{new Date(item.preferredDate).toLocaleDateString('en-IN')} · {money(item.totalAmount)} · {item.status}</small></button>)}</div></section> : <p className="booking-empty">No bookings found for this mobile number.</p>)}{booking && <section className="track-result"><h2>{booking.bookingId}</h2><p><b>Patient:</b> {booking.customer.name}</p><p><b>Tests / Package:</b> {booking.items.map(item => item.name).join(', ')}</p><p><b>Collection:</b> {new Date(booking.preferredDate).toLocaleDateString('en-IN')} · {booking.preferredTimeSlot}</p><p><b>Amount:</b> {money(booking.totalAmount)}</p><p><b>Status:</b> {booking.status}</p><TrackingTimeline status={booking.status} /></section>}</main>
}
