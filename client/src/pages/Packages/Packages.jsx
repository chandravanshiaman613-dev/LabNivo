import { useEffect, useState } from 'react'
import PackageCard from '../../components/PackageCard/PackageCard'
import { getPackages } from '../../services/packageService'
import './Packages.css'
export default function Packages(){const [packages,setPackages]=useState([]),[error,setError]=useState('');useEffect(()=>{getPackages().then(setPackages).catch(()=>setError('Unable to load packages. Please try again.'))},[]);return <main className="catalogue-page"><span className="overline">HEALTH PACKAGES</span><h1>Choose a health package</h1><p>Convenient groups of common doctor-advised health checks.</p>{error?<p className="catalogue-state error-state">{error}</p>:packages.length?<div className="package-grid">{packages.map(pack=><PackageCard key={pack.slug} pack={pack}/>)}</div>:<p className="catalogue-state">Loading packages...</p>}</main>}
