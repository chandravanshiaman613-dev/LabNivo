import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getPackageBySlug } from '../../services/packageService'
import { money } from '../../utils/catalogue'
import { useCart } from '../../context/CartContext'
import { whatsappLink } from '../../config/business'
import './PackageDetails.css'

export default function PackageDetails() {
  const { slug } = useParams()
  const [pack, setPack] = useState(null)
  const [error, setError] = useState('')

  const { add } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    getPackageBySlug(slug)
      .then(setPack)
      .catch(() => setError('Unable to load this package.'))
  }, [slug])

  useEffect(() => {
    if (!pack) return

    const title = `${pack.name} in Indore & Bhopal – Price & Home Collection | LabNivo`
    const description =
      `Book ${pack.name} with LabNivo in Indore and Bhopal. Check package price, included tests and home sample collection availability.`

    document.title = title

    const setMeta = (name, content) => {
      let tag = document.querySelector(`meta[name="${name}"]`)

      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', name)
        document.head.appendChild(tag)
      }

      tag.setAttribute('content', content)
    }

    const setProperty = (property, content) => {
      let tag = document.querySelector(`meta[property="${property}"]`)

      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('property', property)
        document.head.appendChild(tag)
      }

      tag.setAttribute('content', content)
    }

    setMeta('description', description)

    const canonicalUrl = `${window.location.origin}/packages/${pack.slug}`

    let canonical = document.querySelector('link[rel="canonical"]')

    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }

    canonical.setAttribute('href', canonicalUrl)

    setProperty('og:title', title)
    setProperty('og:description', description)
    setProperty('og:type', 'website')
    setProperty('og:url', canonicalUrl)

    if (pack.imageUrl) {
      setProperty('og:image', pack.imageUrl)
      setMeta('twitter:image', pack.imageUrl)
    }

    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)

    const existingSchema = document.getElementById('package-breadcrumb-schema')

    if (existingSchema) {
      existingSchema.remove()
    }

    const script = document.createElement('script')
    script.id = 'package-breadcrumb-schema'
    script.type = 'application/ld+json'

    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${window.location.origin}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Packages',
          item: `${window.location.origin}/packages`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: pack.name,
          item: canonicalUrl
        }
      ]
    })

    document.head.appendChild(script)

    return () => {
      const schema = document.getElementById('package-breadcrumb-schema')
      if (schema) schema.remove()
    }
  }, [pack])

  if (error) {
    return (
      <main className="detail-page">
        <p className="error-state">{error}</p>
      </main>
    )
  }

  if (!pack) {
    return (
      <main className="detail-page">
        Loading package...
      </main>
    )
  }

  const item = {
    ...pack,
    type: 'PACKAGE',
    reference: pack._id,
    price: pack.sellingPrice
  }

  return (
    <main className="detail-page">
      {pack.imageUrl && <img className="detail-image" src={pack.imageUrl} alt={pack.name} onError={event => { event.currentTarget.style.display = 'none' }} />}
      <Link className="back-link" to="/packages">
        ← All packages
      </Link>

      <span className="test-category">
        HEALTH PACKAGE
      </span>

      <h1>{pack.name} in Indore & Bhopal</h1>

      <p>{pack.description}</p>

      <div className="detail-price">
        <span className="mrp">
          {money(pack.mrp)}
        </span>

        <strong>
          {money(pack.sellingPrice)}
        </strong>
      </div>

      <div className="included-box">
        <b>Included tests</b>

        <p>
          {pack.includedTests
            .map(test => test.name)
            .join(', ')}
        </p>
      </div>

      <section className="seo-content">
        <h2>{pack.name} Package in Indore & Bhopal</h2>

        <p>
          LabNivo offers diagnostic health packages with
          convenient booking options in Indore and Bhopal.
          Check the package price and included tests before
          booking.
        </p>

        <h2>Tests Included in This Package</h2>

        <p>
          This health package includes the diagnostic tests
          listed above. Test availability may depend on the
          selected service location.
        </p>

        <h2>Home Sample Collection</h2>

        <p>
          Home sample collection may be available in
          serviceable areas of Indore and Bhopal. Enter your
          location during booking to confirm availability.
        </p>
      </section>

      <button
        className="button button-primary"
        onClick={() => {
          add(item)
          navigate('/book')
        }}
      >
        Book Package
      </button>

      <button className="button button-secondary" onClick={() => add(item)}>Add to Cart</button>

      <a
        className="button button-secondary"
        href={whatsappLink(
          `Hello LAB NIVO, I want to book: Package: ${pack.name} Price: ${money(pack.sellingPrice)} Patient Name: Mobile: Preferred Date: Preferred Time: Address: Please confirm the booking.`
        )}
        target="_blank"
        rel="noreferrer"
      >
        Book on WhatsApp
      </a>
    </main>
  )
}
