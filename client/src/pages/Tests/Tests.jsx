import { useEffect, useState } from 'react'
import TestCard from '../../components/TestCard/TestCard'
import { getTests } from '../../services/testService'
import './Tests.css'

const categories = [
  'All tests',
  'Hematology',
  'Diabetes',
  'Thyroid',
  'Liver',
  'Vitamins'
]

export default function Tests() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // SEO for Tests catalogue page
  useEffect(() => {
    const title =
      'Diagnostic Tests in Indore & Bhopal | LAB NIVO'

    const description =
      'Browse diagnostic blood tests and health tests with LAB NIVO. Check test prices, sample type, report time and home sample collection availability in Indore and Bhopal.'

    document.title = title

    // Meta description
    let metaDescription = document.querySelector(
      'meta[name="description"]'
    )

    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute(
        'name',
        'description'
      )
      document.head.appendChild(metaDescription)
    }

    metaDescription.setAttribute(
      'content',
      description
    )

    // Robots
    let robots = document.querySelector(
      'meta[name="robots"]'
    )

    if (!robots) {
      robots = document.createElement('meta')
      robots.setAttribute('name', 'robots')
      document.head.appendChild(robots)
    }

    robots.setAttribute(
      'content',
      'index, follow, max-image-preview:large'
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

    canonical.setAttribute(
      'href',
      'https://labnivo.in/tests'
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

    setMeta('og:type', 'website')
    setMeta(
      'og:url',
      'https://labnivo.in/tests'
    )
    setMeta(
      'og:title',
      'Diagnostic Tests in Indore & Bhopal | LAB NIVO'
    )
    setMeta(
      'og:description',
      description
    )
    setMeta('og:site_name', 'LAB NIVO')
    setMeta('og:locale', 'en_IN')
    setMeta(
      'og:image',
      'https://labnivo.in/labnivo-logo.png'
    )

    // Twitter / X
    let twitterCard = document.querySelector(
      'meta[name="twitter:card"]'
    )

    if (!twitterCard) {
      twitterCard = document.createElement('meta')
      twitterCard.setAttribute(
        'name',
        'twitter:card'
      )
      document.head.appendChild(twitterCard)
    }

    twitterCard.setAttribute(
      'content',
      'summary_large_image'
    )

    let twitterTitle = document.querySelector(
      'meta[name="twitter:title"]'
    )

    if (!twitterTitle) {
      twitterTitle = document.createElement('meta')
      twitterTitle.setAttribute(
        'name',
        'twitter:title'
      )
      document.head.appendChild(twitterTitle)
    }

    twitterTitle.setAttribute(
      'content',
      'Diagnostic Tests in Indore & Bhopal | LAB NIVO'
    )

    let twitterDescription =
      document.querySelector(
        'meta[name="twitter:description"]'
      )

    if (!twitterDescription) {
      twitterDescription =
        document.createElement('meta')
      twitterDescription.setAttribute(
        'name',
        'twitter:description'
      )
      document.head.appendChild(
        twitterDescription
      )
    }

    twitterDescription.setAttribute(
      'content',
      description
    )

    let twitterImage = document.querySelector(
      'meta[name="twitter:image"]'
    )

    if (!twitterImage) {
      twitterImage = document.createElement('meta')
      twitterImage.setAttribute(
        'name',
        'twitter:image'
      )
      document.head.appendChild(twitterImage)
    }

    twitterImage.setAttribute(
      'content',
      'https://labnivo.in/labnivo-logo.png'
    )

    // Structured data
    const existingSchema = document.getElementById(
      'labnivo-tests-schema'
    )

    if (!existingSchema) {
      const script = document.createElement(
        'script'
      )

      script.id = 'labnivo-tests-schema'
      script.type = 'application/ld+json'

      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Diagnostic Tests in Indore & Bhopal',
        description,
        url: 'https://labnivo.in/tests',
        isPartOf: {
          '@type': 'WebSite',
          name: 'LAB NIVO',
          url: 'https://labnivo.in/'
        }
      })

      document.head.appendChild(script)
    }

    return () => {
      const schema = document.getElementById(
        'labnivo-tests-schema'
      )

      if (schema) {
        schema.remove()
      }
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    setError('')

    getTests({
      ...(search && { search }),
      ...(category && { category }),
      status: 'active'
    })
      .then(setTests)
      .catch(() =>
        setError(
          'Unable to load tests. Please try again.'
        )
      )
      .finally(() => setLoading(false))
  }, [search, category])

  return (
    <main className="catalogue-page">
      <span className="overline">
        TEST CATALOGUE
      </span>

      <h1>
        Diagnostic Tests in Indore & Bhopal
      </h1>

      <p>
        Browse diagnostic blood tests, health tests
        and checkup options. Compare prices, sample
        requirements and report time before booking.
      </p>

      <div className="search-box">
        <span aria-hidden="true">⌕</span>

        <input
          value={search}
          onChange={event =>
            setSearch(event.target.value)
          }
          placeholder="Search CBC, Thyroid, HbA1c, Widal..."
          aria-label="Search diagnostic tests"
        />

        <button type="button">
          Search
        </button>
      </div>

      <div className="chips">
        {categories.map(item => (
          <button
            type="button"
            className={
              category === item ||
              (!category && item === 'All tests')
                ? 'selected'
                : ''
            }
            key={item}
            onClick={() =>
              setCategory(
                item === 'All tests'
                  ? ''
                  : item
              )
            }
          >
            {item}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="catalogue-state">
          Loading tests...
        </p>
      ) : error ? (
        <p className="catalogue-state error-state">
          {error}
        </p>
      ) : tests.length ? (
        <div className="test-grid">
          {tests.map(test => (
            <TestCard
              key={test.slug}
              test={test}
            />
          ))}
        </div>
      ) : (
        <p className="catalogue-state">
          No tests found.
        </p>
      )}
    </main>
  )
}