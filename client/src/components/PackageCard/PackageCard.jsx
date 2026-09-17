import { Link, useNavigate } from 'react-router-dom'
import { money } from '../../utils/catalogue'
import { useCart } from '../../context/CartContext'
import CatalogueVisual from '../CatalogueVisual/CatalogueVisual'
import './PackageCard.css'

export default function PackageCard({ pack }) {
  const { add, remove, items } = useCart()
  const navigate = useNavigate()
  const item = { ...pack, type: 'PACKAGE', reference: pack._id, price: pack.sellingPrice }
  const added = items.some(entry => entry.slug === pack.slug)
  const book = () => { add(item); navigate('/book') }
  const included = (pack.includedTests || []).map(test => test.name).join(', ')

  return <article className="package-card"><CatalogueVisual type="package" label={`${pack.name || ''} ${pack.description || ''}`} imageUrl={pack.imageUrl} /><div className="package-badge">Health package</div><Link to={`/packages/${pack.slug}`}><h3>{pack.name}</h3></Link><p>{included || pack.description}</p><div><span className="mrp">{money(pack.mrp)}</span><strong>{money(pack.sellingPrice)}</strong><em>{pack.discountPercent}% OFF</em></div><div className="package-actions"><button className={added ? 'added-button' : ''} onClick={() => added ? remove(pack.slug) : add(item)}>{added ? 'Added' : 'Add to Cart'}</button>{added && <button className="remove-button" onClick={() => remove(pack.slug)}>Remove</button>}<button className="book-button" onClick={book}>Book Package</button></div></article>
}
