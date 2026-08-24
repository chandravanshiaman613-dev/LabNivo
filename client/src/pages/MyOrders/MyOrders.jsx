import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { sendOtp, verifyOtp } from '../../services/authService'
import { getMyOrders } from '../../services/orderService'
import { money } from '../../utils/catalogue'
import './MyOrders.css'

export default function MyOrders() {
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState(Array(6).fill(''))
  const [sent, setSent] = useState(false)
  const [orders, setOrders] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const inputs = useRef([])
  const code = otp.join('')
  useEffect(() => { if (!cooldown) return; const timer = window.setInterval(() => setCooldown(seconds => Math.max(0, seconds - 1)), 1000); return () => window.clearInterval(timer) }, [cooldown])
  const requestOtp = async () => { setBusy(true); setError(''); try { await sendOtp(mobile); setSent(true); setOtp(Array(6).fill('')); setNotice('OTP sent successfully.'); setCooldown(60); window.setTimeout(() => inputs.current[0]?.focus(), 0) } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to send OTP.') } finally { setBusy(false) } }
  const verify = async () => { setBusy(true); setError(''); try { await verifyOtp(mobile, code); setOrders(await getMyOrders()) } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to verify OTP.') } finally { setBusy(false) } }
  const updateDigit = (index, value) => { const digit = value.replace(/\D/g, '').slice(-1); setOtp(current => current.map((item, position) => position === index ? digit : item)); if (digit && index < 5) inputs.current[index + 1]?.focus() }
  const changeNumber = () => { setSent(false); setOtp(Array(6).fill('')); setNotice(''); setError(''); setCooldown(0) }
  return <main className="booking-page my-orders-page"><span className="overline">MY ORDERS</span><h1>{orders === null ? 'My Orders' : 'My Orders'}</h1>{orders === null ? <section className="booking-form otp-card">{!sent ? <><p>View your bookings securely with your mobile number.</p><label>Mobile Number<input required inputMode="numeric" maxLength="10" pattern="[0-9]{10}" value={mobile} onChange={event => setMobile(event.target.value.replace(/\D/g, ''))} placeholder="Enter mobile number" /></label><button className="button button-primary" disabled={busy || mobile.length !== 10} onClick={requestOtp}>{busy ? 'Sending...' : 'Send OTP'}</button></> : <><p className="success-note">{notice}</p><label>Enter 6-digit OTP</label><div className="otp-inputs">{otp.map((digit, index) => <input key={index} ref={element => { inputs.current[index] = element }} value={digit} inputMode="numeric" maxLength="1" aria-label={`OTP digit ${index + 1}`} onChange={event => updateDigit(index, event.target.value)} onKeyDown={event => { if (event.key === 'Backspace' && !digit && index) inputs.current[index - 1]?.focus() }} />)}</div><button className="button button-primary" disabled={busy || code.length !== 6} onClick={verify}>{busy ? 'Verifying...' : 'Verify OTP'}</button><div className="inline-actions"><button className="text-button" disabled={busy || cooldown > 0} onClick={requestOtp}>{cooldown ? `Resend available in ${cooldown}s` : 'Resend OTP'}</button><button className="text-button" onClick={changeNumber}>Change Number</button></div></>}{error && <p className="form-error">{error}</p>}</section> : <section className="admin-list order-list">{orders.length ? orders.map(order => <Link to={`/my-orders/${order.bookingId}`} key={order.bookingId}><b>{order.bookingId}</b><span>{order.items.map(item => item.name).join(', ')}</span><span>{money(order.totalAmount)} · Collection: {new Date(order.preferredDate).toLocaleDateString('en-IN')}</span><span className="status-pill">{order.status.replaceAll('_', ' ')}</span><small>View Details</small></Link>) : <p>No bookings found for this mobile number.</p>}</section>}</main>
}
