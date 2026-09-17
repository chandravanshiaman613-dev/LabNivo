import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TestCard from '../../components/TestCard/TestCard'
import PackageCard from '../../components/PackageCard/PackageCard'
import { getTests } from '../../services/testService'
import { getPackages } from '../../services/packageService'
import { whatsappLink } from '../../config/business'
import { getSelectedCity, setSelectedCity, SUPPORTED_CITIES } from '../../config/serviceability'
import { useCart } from '../../context/CartContext'
import { money } from '../../utils/catalogue'
import './Home.css'

function SearchResult({ item, type }) {
  const { add } = useCart()
  const navigate = useNavigate()

  const cartItem = {
    ...item,
    type,
    reference: item._id,
    price: item.sellingPrice
  }

  const book = () => {
    add(cartItem)
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
          {money(item.sellingPrice)}{' '}
          {item.reportTAT
            ? `· ${item.reportTAT}`
            : '· Home collection'}
        </span>
      </Link>

      <button
        className="button button-primary"
        onClick={book}
      >
        Book {type === 'TEST' ? 'Test' : 'Package'}
      </button>
    </article>
  )
}

export default function Home() {
  const [tests, setTests] = useState([])
  const [packages, setPackages] = useState([])
  const [search, setSearch] = useState('')
  const [city, setCity] = useState(getSelectedCity)
  const [error, setError] = useState('')

  // Homepage SEO
  useEffect(() => {
    document.title =
      'Diagnostic Tests & Home Collection in Indore & Bhopal | LabNivo'

    const description =
      'Book diagnostic tests and health packages with LabNivo. Check test prices, home sample collection availability and report time in Indore and Bhopal.'

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
      `${window.location.origin}/`
    )
  }, [])

  useEffect(() => {
    Promise.all([
      getTests({ status: 'active' }),
      getPackages()
    ])
      .then(([testData, packageData]) => {
        setTests(testData)
        setPackages(packageData)
      })
      .catch(() => {
        setError('Unable to load catalogue highlights.')
      })
  }, [])

  const matches = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return []

    const testMatches = tests
      .filter(item =>
        `${item.name} ${item.category} ${item.shortDescription}`
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 5)
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
      .slice(0, 4)
      .map(item => ({
        item,
        type: 'PACKAGE'
      }))

    return [...testMatches, ...packageMatches].slice(0, 6)
  }, [search, tests, packages])

  const popular = tests
    .filter(item =>
      /cbc|hba1c|thyroid|vitamin d|liver|kidney/i.test(
        item.name
      )
    )
    .slice(0, 4)

  const visibleTests = popular.length
    ? popular
    : tests.slice(0, 4)

  const selectCity = event => {
    const value = event.target.value
    setCity(value)
    setSelectedCity(value)
  }

  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">LAB NIVO</span>

          <label className="service-city">
            Delivering home sample collection in

            <select
              value={city}
              onChange={selectCity}
            >
              <option value="">Select City</option>

              {SUPPORTED_CITIES.map(item => (
                <option key={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <h1>Diagnostic Tests at Your Doorstep</h1>

          <p className="hero-lead">
            Book diagnostic tests with convenient home
            sample collection.
          </p>

          <div className="home-search">
            <span aria-hidden="true">⌕</span>

            <input
              value={search}
              onChange={event =>
                setSearch(event.target.value)
              }
              placeholder="Search tests, packages or health checks"
              aria-label="Search tests and packages"
            />
          </div>

          {search && (
            <section
              className="home-search-results"
              aria-live="polite"
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
                  <Link to="/tests">
                    Browse all tests
                  </Link>
                </p>
              )}
            </section>
          )}

          <div className="quick-actions">
            <Link to="/upload-prescription">
              <b>Have a Prescription?</b>
              <span>Upload Prescription</span>
            </Link>

            <a
              href={whatsappLink(
                'Hello LAB NIVO, I would like help booking a diagnostic test.'
              )}
              target="_blank"
              rel="noreferrer"
            >
              <b>Need Help?</b>
              <span>Book on WhatsApp</span>
            </a>

            <Link to="/my-orders">
              <b>Already Booked?</b>
              <span>My Orders</span>
            </Link>
          </div>

          <div className="hero-actions">
            <Link
              className="button button-primary"
              to="/tests"
            >
              Explore Tests
            </Link>

            <Link
              className="button button-secondary"
              to="/upload-prescription"
            >
              Upload Prescription
            </Link>
          </div>

          <p className="small-link">
            Already booked?{' '}
            <Link to="/my-orders">
              My Orders
            </Link>
          </p>

          <a
            className="whatsapp-link"
            href={whatsappLink(
              'Hello LAB NIVO, I would like help booking a diagnostic test.'
            )}
            target="_blank"
            rel="noreferrer"
          >
            Prefer WhatsApp? Book directly
          </a>
        </div>

        <div
          className="hero-visual"
          aria-label="Home blood sample collection illustration"
        >
          <div className="hero-blob" />

          <div className="person">
            <div className="person-head" />
            <div className="person-body" />
          </div>

          <div className="medical-card report-card">
            <div className="card-icon">+</div>

            <span>
              Home collection
              <small>at your convenience</small>
            </span>
          </div>

          <div className="medical-card pin-card">
            ⌖ <span>Sample collection</span>
          </div>
        </div>
      </section>

      <section className="quick-bar">
        {[
          ['⌂', 'Home Sample Collection'],
          ['₹', 'Transparent Pricing'],
          ['✓', 'Easy Booking'],
          ['▤', 'Digital Reports']
        ].map(([icon, label]) => (
          <div key={label}>
            <span>{icon}</span>
            <b>{label}</b>
          </div>
        ))}
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="overline">
              POPULAR TESTS
            </span>

            <h2>
              Recommended health checks
            </h2>
          </div>

          <Link to="/tests">
            View all tests →
          </Link>
        </div>

        {error ? (
          <p className="form-error">
            {error}
          </p>
        ) : (
          <div className="test-grid">
            {visibleTests.map(item => (
              <TestCard
                key={item.slug}
                test={item}
              />
            ))}
          </div>
        )}
      </section>

      <section className="section packages-section">
        <div className="section-heading">
          <div>
            <span className="overline">
              HEALTH PACKAGES
            </span>

            <h2>
              Health packages
            </h2>
          </div>

          <Link to="/packages">
            Explore packages →
          </Link>
        </div>

        <div className="package-grid">
          {packages.slice(0, 3).map(item => (
            <PackageCard
              key={item.slug}
              pack={item}
            />
          ))}
        </div>
      </section>

      <section className="prescription-section">
        <div className="prescription-copy">
          <span className="overline light">
            DOCTOR'S PRESCRIPTION
          </span>

          <h2>
            Let us help you find the right tests
          </h2>

          <p>
            Send a prescription and our team will help
            you with the next step.
          </p>

          <Link
            className="button button-primary"
            to="/upload-prescription"
          >
            Upload Prescription
          </Link>
        </div>
      </section>

      <section className="home-info-grid">
        <article><span className="overline">HOW IT WORKS</span><h2>Simple diagnostic booking</h2><ol><li>Search & choose</li><li>Book online</li><li>Sample collection where available</li><li>Processing at the applicable partner laboratory</li><li>Get your report</li></ol><Link className="button button-secondary" to="/how-it-works">Learn how it works</Link></article>
        <article><span className="overline">PARTNER NETWORK</span><h2>Diagnostics, transparently</h2><p>LAB NIVO is a diagnostic booking platform connecting customers with applicable partner diagnostic laboratories. We do not represent LAB NIVO as owning every laboratory.</p><Link className="button button-secondary" to="/partner-network">Partner Network</Link></article>
      </section>

      <section className="home-service-strip"><div><span>⌖</span><b>Currently serving</b><p>Indore · Bhopal</p></div><div><span>⌕</span><b>Check service area</b><p>Confirm availability at booking</p></div><Link className="button button-primary" to="/tests">Book a Test</Link></section>

      <footer
        className="contact-section"
        id="contact"
      >
        <h2>LAB NIVO</h2>

        <p>
          Diagnostics at Your Doorstep
        </p>

        <p>
          <Link to="/">Home</Link>
          {' · '}
          <Link to="/tests">Tests</Link>
          {' · '}
          <Link to="/packages">Packages</Link>
          {' · '}
          <Link to="/upload-prescription">
            Upload Prescription
          </Link>
          {' · '}
          <Link to="/my-orders">
            My Orders
          </Link>
        </p>

        <a
          className="whatsapp-link"
          href={whatsappLink(
            'Hello LAB NIVO, I would like help booking a diagnostic test.'
          )}
          target="_blank"
          rel="noreferrer"
        >
          Book on WhatsApp
        </a>

        <p>
          <small>© LAB NIVO</small>
        </p>
      </footer>
    </main>
  )
}
