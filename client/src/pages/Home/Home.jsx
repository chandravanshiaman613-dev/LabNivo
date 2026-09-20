import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TestCard from '../../components/TestCard/TestCard'
import PackageCard from '../../components/PackageCard/PackageCard'
import { getTests } from '../../services/testService'
import { getPackages } from '../../services/packageService'
import { getCustomerCoupons } from '../../services/couponService'
import { whatsappLink } from '../../config/business'
import {
  getSelectedCity,
  isServiceableCity,
  setSelectedCity,
  SUPPORTED_CITIES
} from '../../config/serviceability'
import { useCart } from '../../context/CartContext'
import { money } from '../../utils/catalogue'
import './Home.css'

function SearchResult({ item, type }) {
  const { add } = useCart()
  const navigate = useNavigate()

  const book = () => {
    add({
      ...item,
      type,
      reference: item._id,
      price: item.sellingPrice
    })

    navigate('/book')
  }

  return (
    <article className="home-search-result">
      <Link
        to={
          type === 'TEST'
            ? `/tests/${item.slug}`
            : `/packages/${item.slug}`
        }
      >
        <b>{item.name}</b>

        <span>
          {money(item.sellingPrice)} · {item.reportTAT || 'Home collection'}
        </span>
      </Link>

      <button
        className="button button-primary"
        onClick={book}
        type="button"
      >
        Book
      </button>
    </article>
  )
}

export default function Home() {
  const [tests, setTests] = useState([])
  const [packages, setPackages] = useState([])
  const [offers, setOffers] = useState([])

  const [search, setSearch] = useState('')
  const [city, setCity] = useState(getSelectedCity)
  const [error, setError] = useState('')
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [slide, setSlide] = useState(0)

  /*
   * SEO
   */
  useEffect(() => {
    const title =
      'LAB NIVO | Diagnostic Test Booking & Home Sample Collection'

    const description =
      'LAB NIVO helps you discover and book diagnostic tests online with convenient home sample collection in Indore.'

    document.title = title

    const setMeta = (attribute, value, content) => {
      let element = document.head.querySelector(
        `meta[${attribute}="${value}"]`
      )

      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, value)
        document.head.appendChild(element)
      }

      element.setAttribute('content', content)
    }

    const setLink = (rel, href) => {
      let element = document.head.querySelector(`link[rel="${rel}"]`)

      if (!element) {
        element = document.createElement('link')
        element.setAttribute('rel', rel)
        document.head.appendChild(element)
      }

      element.setAttribute('href', href)
    }

    setMeta('name', 'description', description)

    setMeta(
      'name',
      'robots',
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    )

    setLink('canonical', 'https://labnivo.in/')

    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:url', 'https://labnivo.in/')
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:site_name', 'LAB NIVO')
    setMeta('property', 'og:locale', 'en_IN')

    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)

    /*
     * Organization structured data.
     */
    const schemaId = 'labnivo-organization-schema'

    let schema = document.getElementById(schemaId)

    if (!schema) {
      schema = document.createElement('script')
      schema.id = schemaId
      schema.type = 'application/ld+json'
      document.head.appendChild(schema)
    }

    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'LAB NIVO',
      url: 'https://labnivo.in/',
      sameAs: [
        'https://www.instagram.com/labnivo.in/'
      ]
    })

    return () => {
      const existingSchema = document.getElementById(schemaId)

      if (existingSchema) {
        existingSchema.remove()
      }
    }
  }, [])

  /*
   * Detect serviceable city
   */
  useEffect(() => {
    if (city || !navigator.geolocation) return

    setDetectingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async position => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          )

          const result = await response.json()

          const detected =
            result?.address?.city ||
            result?.address?.town ||
            result?.address?.county

          if (isServiceableCity(detected)) {
            const supported = SUPPORTED_CITIES.find(
              item => item.toLowerCase() === detected.toLowerCase()
            )

            setCity(supported)
            setSelectedCity(supported)
          }
        } catch {
          // Ignore location detection errors.
        } finally {
          setDetectingLocation(false)
        }
      },
      () => setDetectingLocation(false),
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000
      }
    )
  }, [city])

  /*
   * Load catalogue
   */
  useEffect(() => {
    Promise.all([
      getTests({ status: 'active' }),
      getPackages(),
      getCustomerCoupons().catch(() => [])
    ])
      .then(([testData, packageData, couponData]) => {
        setTests(testData)
        setPackages(packageData)
        setOffers(couponData)
      })
      .catch(() => {
        setError(
          'Unable to load catalogue highlights. Please try again.'
        )
      })
  }, [])

  /*
   * Hero carousel
   */
  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlide(current => (current + 1) % 3)
    }, 4500)

    return () => window.clearInterval(timer)
  }, [])

  /*
   * Search
   */
  const matches = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return []

    const testMatches = tests
      .filter(item =>
        `${item.name} ${item.category} ${item.shortDescription}`
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 4)
      .map(item => ({
        item,
        type: 'TEST'
      }))

    const packageMatches = packages
      .filter(item =>
        `${item.name} ${item.description}`
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 3)
      .map(item => ({
        item,
        type: 'PACKAGE'
      }))

    return [...testMatches, ...packageMatches].slice(0, 6)
  }, [search, tests, packages])

  /*
   * Popular tests
   */
  const popularTests = tests
    .filter(item =>
      /cbc|hba1c|thyroid|vitamin d|liver|kidney/i.test(item.name)
    )
    .slice(0, 4)

  /*
   * Homepage carousel
   */
  const carousel = [
    offers[0]
      ? {
          eyebrow: 'LIMITED TIME OFFER',
          title: `Get ${
            offers[50].discountType === 'PERCENTAGE'
              ? `${offers[0].discountValue}%`
              : money(offers[0].discountValue)
          } OFF`,
          text: 'Selected tests and packages',
          link: '/tests',
          cta: 'Book Now →'
        }
      : {
          eyebrow: 'HEALTH CHECKS',
          title: 'Care that starts with clarity',
          text: 'Explore diagnostic tests and health packages.',
          link: '/tests',
          cta: 'Explore →'
        },
    {
      eyebrow: 'HOME SAMPLE COLLECTION',
      title: 'Diagnostic tests at your doorstep',
      text: 'Convenient sample collection where available.',
      link: '/tests',
      cta: 'Book Test →'
    },
    {
      eyebrow: 'HAVE A PRESCRIPTION?',
      title: "Upload it and we'll help you",
      text: 'Share your prescription and our team will assist.',
      link: '/upload-prescription',
      cta: 'Upload Now →'
    }
  ]

  const selectCity = event => {
    setCity(event.target.value)
    setSelectedCity(event.target.value)
  }

  return (
    <main className="home-page">

      {/* HERO */}
      <section className="lab-hero">
        <div className="lab-hero-copy">

          <span className="hero-brand">LAB NIVO</span>

          <label className="hero-location">
            <span aria-hidden="true">📍</span>

            {detectingLocation
              ? 'Detecting your location...'
              : 'Delivering in'}

            <select
              value={city}
              onChange={selectCity}
              aria-label="Select service city"
            >
              <option value="">Select City</option>

              {SUPPORTED_CITIES.map(item => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <h1>
            Diagnostic Tests & Home Sample Collection in Indore
            <br />
            <em>Accurate Tests. A Healthier Tomorrow.</em>
          </h1>

          <p>
            Book diagnostic tests and health checkup packages online
            with convenient home sample collection in Indore.
          </p>

          <div className="hero-search">
            <span aria-hidden="true">⌕</span>

            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search tests, packages or health concerns..."
              aria-label="Search diagnostic tests and health packages"
            />
          </div>

          {search && (
            <section
              className="home-search-results"
              aria-live="polite"
              aria-label="Search results"
            >
              {matches.length ? (
                matches.map(({ item, type }) => (
                  <SearchResult
                    key={`${type}-${item._id}`}
                    item={item}
                    type={type}
                  />
                ))
              ) : (
                <p>
                  No matching tests or packages.{' '}
                  <Link to="/tests">Browse all tests</Link>
                </p>
              )}
            </section>
          )}

          <div className="hero-actions">
            <Link
              className="button button-primary"
              to="/tests"
            >
              Explore Diagnostic Tests →
            </Link>

            <Link
              className="button button-secondary"
              to="/upload-prescription"
            >
              Upload Prescription
            </Link>
          </div>
        </div>

        <div
          className="lab-hero-art"
          aria-label="Laboratory diagnostic equipment illustration"
        >
          <div className="lab-orbit" />

          <div className="microscope">
            <i />
            <b />
            <strong />
            <span />
          </div>

          <div className="tube tube-one" />
          <div className="tube tube-two" />

          <div className="hero-lab-card">
            ✦
            <span>
              Home collection
              <small>Simple. Convenient.</small>
            </span>
          </div>
        </div>
      </section>

      {/* OFFERS */}
      <section
        className="offer-carousel"
        aria-label="LAB NIVO offers"
      >
        <div
          className="offer-track"
          style={{
            transform: `translateX(-${slide * 100}%)`
          }}
        >
          {carousel.map((item, index) => (
            <article
              className={`offer-slide offer-${index}`}
              key={item.title}
            >
              <span>{item.eyebrow}</span>

              <h2>{item.title}</h2>

              <p>{item.text}</p>

              <Link to={item.link}>
                {item.cta}
              </Link>
            </article>
          ))}
        </div>

        <div className="offer-dots">
          {carousel.map((item, index) => (
            <button
              type="button"
              key={item.title}
              className={slide === index ? 'active' : ''}
              aria-label={`Show offer ${index + 1}`}
              onClick={() => setSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section
        className="benefit-grid"
        aria-label="LAB NIVO benefits"
      >
        {[
          ['⌂', 'Home Sample Collection'],
          ['✓', 'Reliable Reports'],
          ['₹', 'Transparent Pricing'],
          ['↗', 'Easy Booking'],
          ['◉', 'WhatsApp Support']
        ].map(([icon, label]) => (
          <article key={label}>
            <i aria-hidden="true">{icon}</i>
            <span>{label}</span>
          </article>
        ))}
      </section>

      {/* PACKAGES */}
      <section className="home-section package-showcase">
        <div className="home-heading">
          <div>
            <span>POPULAR HEALTH PACKAGES</span>

            <h2>
              Health checkups made simple
            </h2>
          </div>

          <Link to="/packages">
            View all →
          </Link>
        </div>

        {error ? (
          <p className="form-error">{error}</p>
        ) : (
          <div className="package-grid">
            {packages
              .slice(0, 3)
              .map(item => (
                <PackageCard
                  key={item.slug}
                  pack={item}
                />
              ))}
          </div>
        )}
      </section>

      {/* TESTS */}
      <section className="home-section test-showcase">
        <div className="home-heading">
          <div>
            <span>POPULAR DIAGNOSTIC TESTS</span>

            <h2>
              Find the test you need
            </h2>
          </div>

          <Link to="/tests">
            View all →
          </Link>
        </div>

        <div className="test-grid">
          {(popularTests.length
            ? popularTests
            : tests.slice(0, 4)
          ).map(item => (
            <TestCard
              key={item.slug}
              test={item}
            />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <span>HOW IT WORKS</span>

        <h2>
          Book a diagnostic test in four simple steps
        </h2>

        <div>
          {[
            ['01', 'Choose Test'],
            ['02', 'Book Appointment'],
            ['03', 'Home Sample Collection'],
            ['04', 'Get Report']
          ].map(([number, label]) => (
            <article key={number}>
              <b>{number}</b>
              <p>{label}</p>
            </article>
          ))}
        </div>
      </section>

      {/* HOME COLLECTION */}
      <section className="home-section home-collection-seo">
        <span>HOME SAMPLE COLLECTION</span>

        <h2>
          Diagnostic Tests at Your Doorstep
        </h2>

        <p>
          Book online and choose home sample collection where available.
        </p>

        <Link
          className="button button-primary"
          to="/tests"
        >
          Browse Diagnostic Tests
        </Link>
      </section>

      {/* FAQ */}
      <section
        className="home-section home-faq"
        aria-labelledby="labnivo-faq-heading"
      >
        <span>FAQ</span>

        <h2 id="labnivo-faq-heading">
          FAQs
        </h2>

        <details>
          <summary>
            What is LAB NIVO?
          </summary>

          <p>
            LAB NIVO is an online platform for discovering and
            booking diagnostic tests and health checkup packages.
          </p>
        </details>

        <details>
          <summary>
            Can I book diagnostic tests online?
          </summary>

          <p>
            Yes. You can browse available tests and packages,
            check their details and proceed with online booking
            through LAB NIVO.
          </p>
        </details>

        <details>
          <summary>
            Is home sample collection available?
          </summary>

          <p>
            Home sample collection is available for supported
            services and locations. Availability is shown during
            the booking process.
          </p>
        </details>

        <details>
          <summary>
            Which cities does LAB NIVO serve?
          </summary>

          <p>
            LAB NIVO currently supports the service cities
            configured on the platform. Select your city on the
            website to check availability.
          </p>
        </details>

        <details>
          <summary>
            How can I find a specific diagnostic test?
          </summary>

          <p>
            Use the search box on the homepage to search for
            diagnostic tests or health packages by name or
            related information.
          </p>
        </details>
      </section>

      {/* PRESCRIPTION CTA */}
      <section className="home-cta">
        <div>
          <span>DOCTOR'S PRESCRIPTION</span>

          <h2>
            Need help choosing tests?
          </h2>

          <p>
            Upload a prescription or speak to our team on
            WhatsApp.
          </p>
        </div>

        <div>
          <Link
            className="button button-primary"
            to="/upload-prescription"
          >
            Upload Prescription
          </Link>

          <a
            className="button button-secondary"
            href={whatsappLink(
              'Hello LAB NIVO, I would like help booking a diagnostic test.'
            )}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp Us
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="contact-section">
        <h2>LAB NIVO</h2>

        <p>
          Diagnostics at Your Doorstep
        </p>

        <p>
          <Link to="/tests">
            Diagnostic Tests
          </Link>{' '}
          ·{' '}
          <Link to="/packages">
            Health Packages
          </Link>{' '}
          ·{' '}
          <Link to="/my-orders">
            My Orders
          </Link>{' '}
          ·{' '}
          <Link to="/contact">
            Need Help
          </Link>
        </p>
      </footer>

    </main>
  )
}