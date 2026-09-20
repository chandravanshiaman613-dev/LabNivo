import { useEffect, useMemo, useState } from 'react'
import PackageCard from '../../components/PackageCard/PackageCard'
import { getPackages } from '../../services/packageService'
import './Packages.css'

export default function Packages() {
  const [packages, setPackages] = useState([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  // SEO for health packages page
  useEffect(() => {
    const title =
      'Health Checkup Packages in Indore & Bhopal | LAB NIVO'

    const description =
      'Explore health checkup and diagnostic packages with LAB NIVO. Compare package details, included tests and convenient home sample collection availability in Indore and Bhopal.'

    document.title = title

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

    setNameMeta(
      'description',
      description
    )

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

    canonical.setAttribute(
      'href',
      'https://labnivo.in/packages'
    )

    // Open Graph
    setPropertyMeta('og:type', 'website')
    setPropertyMeta(
      'og:url',
      'https://labnivo.in/packages'
    )
    setPropertyMeta(
      'og:title',
      title
    )
    setPropertyMeta(
      'og:description',
      description
    )
    setPropertyMeta(
      'og:site_name',
      'LAB NIVO'
    )
    setPropertyMeta(
      'og:locale',
      'en_IN'
    )
    setPropertyMeta(
      'og:image',
      'https://labnivo.in/labnivo-logo.png'
    )

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
      'https://labnivo.in/labnivo-logo.png'
    )

    // Structured data
    const schemaId =
      'labnivo-packages-schema'

    let schema =
      document.getElementById(schemaId)

    if (!schema) {
      schema = document.createElement('script')
      schema.id = schemaId
      schema.type = 'application/ld+json'
      document.head.appendChild(schema)
    }

    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name:
        'Health Checkup Packages in Indore & Bhopal',
      description,
      url: 'https://labnivo.in/packages',
      isPartOf: {
        '@type': 'WebSite',
        name: 'LAB NIVO',
        url: 'https://labnivo.in/'
      }
    })

    return () => {
      const existingSchema =
        document.getElementById(schemaId)

      if (existingSchema) {
        existingSchema.remove()
      }
    }
  }, [])

  // Load packages
  useEffect(() => {
    getPackages()
      .then(setPackages)
      .catch(() =>
        setError(
          'Unable to load packages. Please try again.'
        )
      )
  }, [])

  // Search packages
  const visible = useMemo(() => {
    return packages.filter(pack =>
      `${pack.name} ${pack.description} ${
        (pack.includedTests || [])
          .map(test => test.name)
          .join(' ')
      }`
        .toLowerCase()
        .includes(query.toLowerCase())
    )
  }, [packages, query])

  return (
    <main className="catalogue-page">
      <span className="overline">
        HEALTH PACKAGES
      </span>

      <h1>
        Health Checkup Packages in Indore & Bhopal
      </h1>

      <p>
        Explore diagnostic health checkup packages,
        compare included tests and check available
        home sample collection options before booking.
      </p>

      <div className="search-box">
        <span aria-hidden="true">⌕</span>

        <input
          value={query}
          onChange={event =>
            setQuery(event.target.value)
          }
          placeholder="Search packages..."
          aria-label="Search health checkup packages"
        />

        <button type="button">
          Search
        </button>
      </div>

      {error ? (
        <p className="catalogue-state error-state">
          {error}
        </p>
      ) : !packages.length ? (
        <p className="catalogue-state">
          Loading packages...
        </p>
      ) : visible.length ? (
        <div className="package-grid">
          {visible.map(pack => (
            <PackageCard
              key={pack.slug}
              pack={pack}
            />
          ))}
        </div>
      ) : (
        <p className="catalogue-state">
          No packages match your search.
        </p>
      )}
    </main>
  )
}