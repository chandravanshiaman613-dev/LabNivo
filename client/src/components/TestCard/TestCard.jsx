import { Link, useNavigate } from 'react-router-dom'
import { money } from '../../utils/catalogue'
import { useCart } from '../../context/CartContext'
import './TestCard.css'

export default function TestCard({ test }) {
  const { add, remove, items } = useCart()
  const navigate = useNavigate()
  const item = { ...test, type: 'TEST', reference: test._id, price: test.sellingPrice }
  const added = items.some(entry => entry.slug === test.slug)
  const visual = test.imageUrl ? <img src={test.imageUrl} alt="" onError={e=>{e.currentTarget.style.display='none'}}/> : <span aria-hidden="true">{/diabetes|hba1c|sugar/i.test(`${test.category} ${test.name}`)?'◉':/thyroid/i.test(`${test.category} ${test.name}`)?'◌':/liver/i.test(`${test.category} ${test.name}`)?'◒':/kidney/i.test(`${test.category} ${test.name}`)?'◍':/vitamin/i.test(`${test.category} ${test.name}`)?'✦':'✚'}</span>
  return <article className="test-card"><div className="test-image">{visual}</div><div className="test-card-top"><span className="test-category">{test.category}</span></div><Link to={`/tests/${test.slug}`}><h3>{test.name}</h3></Link><p>{test.shortDescription}</p><div className="price-row"><span className="mrp">{money(test.mrp)}</span><strong>{money(test.sellingPrice)}</strong><em>{test.discountPercent}% OFF</em></div><div className="test-meta"><span>{test.homeCollection===false?'Lab visit':'Home collection'}</span><span>{test.reportTAT}</span></div><div className="package-actions"><button className={added ? 'added-button' : ''} onClick={() => added ? remove(test.slug) : add(item)}>{added ? '✓ Added to Cart' : 'Add to Cart'}</button>{added && <button className="remove-button" onClick={() => remove(test.slug)}>Remove</button>}<button className="book-button" onClick={() => { add(item); navigate('/book') }}>Book Test</button></div></article>
}
