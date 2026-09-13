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
    document.title =
      'Diagnostic Tests in Indore & Bhopal | LabNivo'

    const description =
      'Browse diagnostic blood tests and health tests with LabNivo. Check test prices, sample type, report time and home sample collection availability in Indore and Bhopal.'

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
      `${window.location.origin}/tests`
    )
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
        Browse diagnostic tests, check prices, sample
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