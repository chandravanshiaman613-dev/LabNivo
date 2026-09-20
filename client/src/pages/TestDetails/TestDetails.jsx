import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getTestBySlug } from '../../services/testService'
import { money } from '../../utils/catalogue'
import { useCart } from '../../context/CartContext'
import { whatsappLink } from '../../config/business'
import './TestDetails.css'

export default function TestDetails() {
  const { slug } = useParams()
  const [test, setTest] = useState(null)
  const [error, setError] = useState('')

  const { add } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    getTestBySlug(slug)
      .then(setTest)
      .catch(() =>
        setError(
          'Unable to load this test. Please try again.'
        )
      )
  }, [slug])

  // SEO for individual test page
  useEffect(() => {
    if (!test) return

    const baseUrl = 'https://labnivo.in'
    const pageUrl = `${baseUrl}/tests/${test.slug}`
    const locationText = 'Indore & Bhopal'

    const title =
      `${test.name} in ${locationText} | LAB NIVO`

    const description =
      `Book ${test.name} with LAB NIVO in ${locationText}. Check price, sample type, preparation, report time and home sample collection availability.`

    document.title = title

    // Helper: normal meta tag
    const setNameMeta = (name, content) => {
      let element = document.querySelector(
        `meta[name="${name}"]`
      )

      if (!element) {
        element = document.createElement('meta')
        element.setAttribute('name', name)
        document.head.appendChild(element)
      }

      element.setAttribute('content', content)
    }

    // Helper: Open Graph meta
    const setPropertyMeta = (property, content) => {
      let element = document.querySelector(
        `meta[property="${property}"]`
      )

      if (!element) {
        element = document.createElement('meta')
        element.setAttribute('property', property)
        document.head.appendChild(element)
      }

      element.setAttribute('content', content)
    }

    // Meta description
    setNameMeta('description', description)

    // Robots
    setNameMeta(
      'robots',
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    )

    // Canonical
    let canonical = document.querySelector(
      'link[rel="canonical"]'
    )

    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }

    canonical.setAttribute('href', pageUrl)

    // Open Graph
    setPropertyMeta('og:type', 'website')
    setPropertyMeta('og:url', pageUrl)
    setPropertyMeta('og:title', title)
    setPropertyMeta(
      'og:description',
      description
    )
    setPropertyMeta('og:site_name', 'LAB NIVO')
    setPropertyMeta('og:locale', 'en_IN')

    if (test.imageUrl) {
      setPropertyMeta(
        'og:image',
        test.imageUrl
      )
    } else {
      setPropertyMeta(
        'og:image',
        `${baseUrl}/labnivo-logo.png`
      )
    }

    // Twitter / X
    setNameMeta(
      'twitter:card',
      'summary_large_image'
    )

    setNameMeta(
      'twitter:title',
      title
    )

    setNameMeta(
      'twitter:description',
      description
    )

    setNameMeta(
      'twitter:image',
      test.imageUrl ||
        `${baseUrl}/labnivo-logo.png`
    )

    // Remove old test schemas before adding fresh ones
    document
      .querySelectorAll(
        '[data-labnivo-test-schema="true"]'
      )
      .forEach(element => element.remove())

    // Breadcrumb schema
    const breadcrumbSchema =
      document.createElement('script')

    breadcrumbSchema.type =
      'application/ld+json'

    breadcrumbSchema.dataset.labnivoTestSchema =
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
            name: 'Diagnostic Tests',
            item: `${baseUrl}/tests`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: test.name,
            item: pageUrl
          }
        ]
      })

    document.head.appendChild(
      breadcrumbSchema
    )

    // Product / test information schema
    const productSchema =
      document.createElement('script')

    productSchema.type =
      'application/ld+json'

    productSchema.dataset.labnivoTestSchema =
      'true'

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: test.name,
      description:
        test.shortDescription ||
        description,
      url: pageUrl,
      brand: {
        '@type': 'Brand',
        name: 'LAB NIVO'
      },
      offers: {
        '@type': 'Offer',
        url: pageUrl,
        priceCurrency: 'INR',
        price: String(test.sellingPrice),
        availability:
          'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: 'LAB NIVO',
          url: baseUrl
        }
      }
    }

    if (test.imageUrl) {
      schemaData.image = [test.imageUrl]
    }

    productSchema.textContent =
      JSON.stringify(schemaData)

    document.head.appendChild(
      productSchema
    )

    return () => {
      document
        .querySelectorAll(
          '[data-labnivo-test-schema="true"]'
        )
        .forEach(element => element.remove())
    }
  }, [test])

  if (error) {
    return (
      <main className="detail-page">
        <p className="error-state">
          {error}
        </p>
      </main>
    )
  }

  if (!test) {
    return (
      <main className="detail-page">
        Loading test...
      </main>
    )
  }

  const item = {
    ...test,
    type: 'TEST',
    reference: test._id,
    price: test.sellingPrice
  }

  const whatsappMessage =
    `Hello LAB NIVO, I want to book: ` +
    `Test: ${test.name} ` +
    `Price: ${money(test.sellingPrice)} ` +
    `Patient Name: ` +
    `Mobile: ` +
    `Preferred Date: ` +
    `Preferred Time: ` +
    `Address: ` +
    `Please confirm the booking.`

  return (
    <main className="detail-page">
      {test.imageUrl && (
        <img
          className="detail-image"
          src={test.imageUrl}
          alt={`${test.name} diagnostic test - LAB NIVO`}
          onError={event => {
            event.currentTarget.style.display =
              'none'
          }}
        />
      )}

      <Link
        className="back-link"
        to="/tests"
      >
        ← All tests
      </Link>

      <span className="test-category">
        {test.category}
      </span>

      <h1>
        {test.name} in Indore & Bhopal
      </h1>

      <p>
        {test.shortDescription}
      </p>

      <div className="detail-price">
        <span className="mrp">
          {money(test.mrp)}
        </span>

        <strong>
          {money(test.sellingPrice)}
        </strong>
      </div>

      <div className="detail-meta">
        <div>
          <b>Sample type</b>
          <span>
            {test.sampleType}
          </span>
        </div>

        <div>
          <b>Preparation</b>
          <span>
            {test.preparation}
          </span>
        </div>

        <div>
          <b>Report timeline</b>
          <span>
            {test.reportTAT}
          </span>
        </div>

        <div>
          <b>Home collection</b>
          <span>
            {test.homeCollection
              ? 'Available'
              : 'Not available'}
          </span>
        </div>
      </div>

      <section className="test-seo-content">
        <h2>
          {test.name} Test in Indore & Bhopal
        </h2>

        <p>
          LAB NIVO provides convenient diagnostic
          test booking with available home sample
          collection. You can check the test price,
          sample type, preparation requirements and
          expected report timeline before booking.
        </p>

        <h2>
          {test.name} Test Preparation
        </h2>

        <p>
          {test.preparation}
        </p>

        <h2>
          {test.name} Report Time
        </h2>

        <p>
          The listed report timeline for this test
          is{' '}
          <strong>
            {test.reportTAT}
          </strong>
          . Actual processing time can depend on
          the partner laboratory and sample
          conditions.
        </p>
      </section>

      <div className="detail-actions">
        <button
          className="button button-primary"
          onClick={() => {
            add(item)
            navigate('/book')
          }}
        >
          Book Test
        </button>

        <button
          className="button button-secondary"
          onClick={() => add(item)}
        >
          Add to Cart
        </button>

        <a
          className="button button-secondary"
          href={whatsappLink(whatsappMessage)}
          target="_blank"
          rel="noreferrer"
        >
          Book on WhatsApp
        </a>
      </div>
    </main>
  )
}