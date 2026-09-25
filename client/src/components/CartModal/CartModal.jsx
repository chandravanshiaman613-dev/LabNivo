import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { money } from '../../utils/catalogue'
import './CartModal.css'

export default function CartModal() {
  const { open, setOpen, items, remove, clear, total, setCouple } = useCart(); const navigate = useNavigate()
  if (!open) return null
  const book = () => { setOpen(false); navigate('/book') }
  return <div className="modal-backdrop" onClick={() => setOpen(false)}><section className="modal cart-drawer" onClick={event => event.stopPropagation()}><button className="close" aria-label="Close cart" onClick={() => setOpen(false)}>×</button><div className="cart-title"><div><span className="overline">YOUR SELECTION</span><h2>My Cart <small>{items.length} items</small></h2></div>{items.length > 0 && <button className="text-button" onClick={clear}>Clear all</button>}</div>{items.length ? <><div className="cart-items">{items.map(item => <div key={item.slug}><span className="cart-icon">{item.type === 'PACKAGE' ? '✚' : '◉'}</span><span><b>{item.name}</b><small>{item.couple ? '2 People · Health package' : item.type === 'PACKAGE' ? 'Health package' : 'Diagnostic test'}</small>{item.couple&&<small>Person 1: {money(item.price||item.sellingPrice)} · Person 2: {money(Math.max(0,(item.price||item.sellingPrice)-100))}<br/>Couple discount: -{money(Math.min(100,item.price||item.sellingPrice))}</small>}{item.type==='PACKAGE'&&!item.couple&&<button className="cart-add-person" onClick={()=>setCouple(item.slug,true)}>+ Add Another Person — Save ₹100</button>}</span><strong>{money((item.price||item.sellingPrice)*(item.couple?2:1)-(item.couple?Math.min(100,item.price||item.sellingPrice):0))}</strong><button onClick={() => remove(item.slug)}>Remove</button></div>)}</div><section className="cart-coupon-note"><b>Have a coupon code?</b><span>Apply it securely during booking.</span></section><div className="total"><span>Subtotal</span><b>{money(total)}</b></div><button className="button button-primary full" onClick={book}>Proceed to Booking</button></> : <div className="empty">Your cart is empty.</div>}</section></div>
}
