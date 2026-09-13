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

  // Dynamic SEO for every test page
  useEffect(() => {
    if (!test) return

    const locationText = 'Indore & Bhopal'

    document.title =
      `${test.name} in ${locationText} – Price & Home Collection | LabNivo`

    const description =
      `Book ${test.name} with LabNivo in ${locationText}. Check price, sample type, preparation, report time and home sample collection availability.`

    let meta = document.querySelector(
      'meta[name="description"]'
    )

    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }

    meta.setAttribute('content', description)

    let canonical = document.querySelector(
      'link[rel="canonical"]'
    )

    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }

    canonical.setAttribute(
      'href',
      `${window.location.origin}/tests/${test.slug}`
    )

    // Open Graph
    const setMeta = (property, content) => {
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

    setMeta(
      'og:title',
      `${test.name} in ${locationText} | LabNivo`
    )

    setMeta(
      'og:description',
      description
    )

    setMeta(
      'og:type',
      'website'
    )

    setMeta(
      'og:url',
      `${window.location.origin}/tests/${test.slug}`
    )

    if (test.imageUrl) {
      setMeta(
        'og:image',
        test.imageUrl
      )
    }

    // Twitter
    const setTwitterMeta = (name, content) => {
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

    setTwitterMeta(
      'twitter:card',
      'summary_large_image'
    )

    setTwitterMeta(
      'twitter:title',
      `${test.name} in ${locationText} | LabNivo`
    )

    setTwitterMeta(
      'twitter:description',
      description
    )

    if (test.imageUrl) {
      setTwitterMeta(
        'twitter:image',
        test.imageUrl
      )
    }

    // Breadcrumb structured data
    const schemaId = 'labnivo-test-breadcrumb-schema'

    let schema = document.getElementById(schemaId)

    if (!schema) {
      schema = document.createElement('script')
      schema.id = schemaId
      schema.type = 'application/ld+json'
      document.head.appendChild(schema)
    }

    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: window.location.origin
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Tests',
          item: `${window.location.origin}/tests`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: test.name,
          item: `${window.location.origin}/tests/${test.slug}`
        }
      ]
    })
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
          LabNivo provides convenient diagnostic test
          booking with available home sample collection.
          You can check the test price, sample type,
          preparation requirements and expected report
          timeline before booking.
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
          The listed report timeline for this test is{' '}
          <strong>
            {test.reportTAT}
          </strong>.
          Actual processing time can depend on the
          partner laboratory and sample conditions.
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