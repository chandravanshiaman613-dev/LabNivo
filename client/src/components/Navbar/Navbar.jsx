import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { BUSINESS_PHONE_NUMBER, whatsappLink } from '../../config/business'
import './Navbar.css'

export default function Navbar() {
  const { items, setOpen } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const close = () => setMenuOpen(false)
  const message = 'Hello LAB NIVO, I would like help booking a diagnostic test.'
  return <>
    <div className="contact-bar"><span>Call us: <a href={`tel:${BUSINESS_PHONE_NUMBER}`}>+91 7987659405</a></span><a href={whatsappLink(message)} target="_blank" rel="noreferrer">WhatsApp</a><span>Home Sample Collection</span></div>
    <header className="navbar"><Link className="brand" to="/"><span className="brand-mark">N</span><span>LAB <b>NIVO</b><small>Diagnostics at Your Doorstep</small></span></Link><nav className={menuOpen ? 'mobile-open' : ''}><NavLink onClick={close} to="/">Home</NavLink><NavLink onClick={close} to="/tests">Tests</NavLink><NavLink onClick={close} to="/packages">Packages</NavLink><Link onClick={close} to="/how-it-works">How It Works</Link><NavLink onClick={close} to="/upload-prescription">For Patients</NavLink><NavLink onClick={close} to="/my-orders">Track Booking</NavLink><Link onClick={close} to="/contact">Contact Us</Link><Link onClick={close} to="/partner-network">Partner Network</Link><a className="nav-whatsapp" href={whatsappLink(message)} target="_blank" rel="noreferrer">Login / Sign Up via WhatsApp</a></nav><div className="nav-controls"><button className="cart-button" aria-label="Open cart" onClick={() => setOpen(true)}>Cart <span>{items.length}</span></button><button className="menu-button" aria-label="Open navigation menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>☰</button></div></header>
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation"><NavLink to="/">⌂<span>Home</span></NavLink><NavLink to="/tests">⌕<span>Tests</span></NavLink><NavLink to="/packages">▣<span>Packages</span></NavLink><NavLink to="/my-orders">◷<span>Orders</span></NavLink><a href={whatsappLink(message)} target="_blank" rel="noreferrer">◉<span>WhatsApp</span></a></nav>
  </>
}
