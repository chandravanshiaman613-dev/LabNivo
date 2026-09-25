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

  const { add, setCouple } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    getPackageBySlug(slug)
      .then(setPack)
      .catch(() =>
        setError(
          'Unable to load this package.'
        )
      )
  }, [slug])

  // SEO for individual package page
  useEffect(() => {
    if (!pack) return

    const baseUrl = 'https://labnivo.in'
    const pageUrl =
      `${baseUrl}/packages/${pack.slug}`

    const title =
      `${pack.name} in Indore & Bhopal | LAB NIVO`

    const description =
      `Book ${pack.name} with LAB NIVO in Indore and Bhopal. Check package price, included tests and home sample collection availability.`

    document.title = title

    // Normal meta tags
    const setMeta = (name, content) => {
      let tag = document.querySelector(
        `meta[name="${name}"]`
      )

      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', name)
        document.head.appendChild(tag)
      }

      tag.setAttribute('content', content)
    }

    // Open Graph tags
    const setProperty = (
      property,
      content
    ) => {
      let tag = document.querySelector(
        `meta[property="${property}"]`
      )

      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute(
          'property',
          property
        )
        document.head.appendChild(tag)
      }

      tag.setAttribute('content', content)
    }

    setMeta(
      'description',
      description
    )

    setMeta(
      'robots',
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    )

    // Canonical
    let canonical = document.querySelector(
      'link[rel="canonical"]'
    )

    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute(
        'rel',
        'canonical'
      )
      document.head.appendChild(canonical)
    }

    canonical.setAttribute(
      'href',
      pageUrl
    )

    // Open Graph
    setProperty(
      'og:type',
      'product'
    )

    setProperty(
      'og:url',
      pageUrl
    )

    setProperty(
      'og:title',
      title
    )

    setProperty(
      'og:description',
      description
    )

    setProperty(
      'og:site_name',
      'LAB NIVO'
    )

    setProperty(
      'og:locale',
      'en_IN'
    )

    setProperty(
      'og:image',
      pack.imageUrl ||
        `${baseUrl}/labnivo-logo.png`
    )

    // Twitter / X
    setMeta(
      'twitter:card',
      'summary_large_image'
    )

    setMeta(
      'twitter:title',
      title
    )

    setMeta(
      'twitter:description',
      description
    )

    setMeta(
      'twitter:image',
      pack.imageUrl ||
        `${baseUrl}/labnivo-logo.png`
    )

    // Remove previous package schemas
    document
      .querySelectorAll(
        '[data-labnivo-package-schema="true"]'
      )
      .forEach(element =>
        element.remove()
      )

    // Breadcrumb schema
    const breadcrumbSchema =
      document.createElement('script')

    breadcrumbSchema.type =
      'application/ld+json'

    breadcrumbSchema.dataset.labnivoPackageSchema =
      'true'

    breadcrumbSchema.textContent =
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${baseUrl}/`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Health Packages',
            item: `${baseUrl}/packages`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: pack.name,
            item: pageUrl
          }
        ]
      })

    document.head.appendChild(
      breadcrumbSchema
    )

    // Package Product schema
    const productSchema =
      document.createElement('script')

    productSchema.type =
      'application/ld+json'

    productSchema.dataset.labnivoPackageSchema =
      'true'

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: pack.name,
      description:
        pack.description || description,
      url: pageUrl,
      brand: {
        '@type': 'Brand',
        name: 'LAB NIVO'
      },
      offers: {
        '@type': 'Offer',
        url: pageUrl,
        priceCurrency: 'INR',
        price: String(
          pack.sellingPrice
        ),
        availability:
          'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: 'LAB NIVO',
          url: baseUrl
        }
      }
    }

    if (pack.imageUrl) {
      schemaData.image = [
        pack.imageUrl
      ]
    }

    productSchema.textContent =
      JSON.stringify(schemaData)

    document.head.appendChild(
      productSchema
    )

    return () => {
      document
        .querySelectorAll(
          '[data-labnivo-package-schema="true"]'
        )
        .forEach(element =>
          element.remove()
        )
    }
  }, [pack])

  if (error) {
    return (
      <main className="detail-page">
        <p className="error-state">
          {error}
        </p>
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

  const whatsappMessage =
    `Hello LAB NIVO, I want to book: ` +
    `Package: ${pack.name} ` +
    `Price: ${money(pack.sellingPrice)} ` +
    `Patient Name: ` +
    `Mobile: ` +
    `Preferred Date: ` +
    `Preferred Time: ` +
    `Address: ` +
    `Please confirm the booking.`

  return (
    <main className="detail-page">
      {pack.imageUrl && (
        <img
          className="detail-image"
          src={pack.imageUrl}
          alt={`${pack.name} health checkup package - LAB NIVO`}
          onError={event => {
            event.currentTarget.style.display =
              'none'
          }}
        />
      )}

      <Link
        className="back-link"
        to="/packages"
      >
        ← All packages
      </Link>

      <span className="test-category">
        HEALTH PACKAGE
      </span>

      <h1>
        {pack.name} in Indore & Bhopal
      </h1>

      <p>
        {pack.description}
      </p>

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
        <h2>
          {pack.name} Package in Indore & Bhopal
        </h2>

        <p>
          LAB NIVO offers diagnostic health
          packages with convenient booking options
          in Indore and Bhopal. Check the package
          price and included tests before booking.
        </p>

        <h2>
          Tests Included in This Package
        </h2>

        <p>
          This health package includes the
          diagnostic tests listed above. Test
          availability may depend on the selected
          service location.
        </p>

        <h2>
          Home Sample Collection
        </h2>

        <p>
          Home sample collection may be available
          in serviceable areas of Indore and
          Bhopal. Enter your location during
          booking to confirm availability.
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

      <button
        className="button button-secondary"
        onClick={() => add(item)}
      >
        Add to Cart
      </button>

      <button
        className="button button-secondary"
        onClick={() => {
          add(item)
          setCouple(pack.slug, true)
        }}
      >
        + Add Another Person — Save ₹100
      </button>

      <a
        className="button button-secondary"
        href={whatsappLink(
          whatsappMessage
        )}
        target="_blank"
        rel="noreferrer"
      >
        Book on WhatsApp
      </a>
    </main>
  )
}
