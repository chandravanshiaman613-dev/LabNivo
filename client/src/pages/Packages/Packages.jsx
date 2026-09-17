import { useEffect, useMemo, useState } from 'react'
import PackageCard from '../../components/PackageCard/PackageCard'
import { getPackages } from '../../services/packageService'
import './Packages.css'

export default function Packages() {
  const [packages, setPackages] = useState([]), [query, setQuery] = useState(''), [error, setError] = useState('')
  useEffect(() => { getPackages().then(setPackages).catch(() => setError('Unable to load packages. Please try again.')) }, [])
  const visible = useMemo(() => packages.filter(pack => `${pack.name} ${pack.description} ${(pack.includedTests || []).map(test => test.name).join(' ')}`.toLowerCase().includes(query.toLowerCase())), [packages, query])
  return <main className="catalogue-page"><span className="overline">HEALTH PACKAGES</span><h1>Health Packages</h1><p>Convenient groups of common diagnostic health checks.</p><div className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search packages..." aria-label="Search health packages"/><button type="button">Search</button></div>{error ? <p className="catalogue-state error-state">{error}</p> : !packages.length ? <p className="catalogue-state">Loading packages...</p> : visible.length ? <div className="package-grid">{visible.map(pack => <PackageCard key={pack.slug} pack={pack}/>)}</div> : <p className="catalogue-state">No packages match your search.</p>}</main>
}
