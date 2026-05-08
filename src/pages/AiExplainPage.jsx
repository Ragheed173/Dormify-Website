import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HousingCard from '../components/HousingCard'
import api from '../api/axiosInstance'
import { validateAiHousingSearchForm } from '../utils/validation'

const examples = [
  'I need a single room near the university under 150',
  'I need a single room under 150',
  'Housing for female students under 200',
]

const sourceBadgeClass = {
  groq: 'bg-success',
  gemini: 'bg-primary',
  mock: 'bg-secondary',
  local: 'bg-info',
}

const filterLabels = {
  single: 'Single room',
  double: 'Double room',
  triple: 'Triple room',
  male: 'Male',
  female: 'Female',
  both: 'Both',
}

function AiExplainPage() {
  const [query, setQuery] = useState('')
  const [aiInfo, setAiInfo] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [infoLoading, setInfoLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAiInfo = async () => {
      try {
        const res = await api.get('/ai')
        setAiInfo(res.data?.data || null)
      } catch (err) {
        setAiInfo(null)
      } finally {
        setInfoLoading(false)
      }
    }

    fetchAiInfo()
  }, [])

  const handleExampleClick = (value) => {
    setQuery(value)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validateAiHousingSearchForm({ query })
    if (validationError) {
      setError(validationError)
      setResult(null)
      return
    }

    try {
      setLoading(true)
      setError('')
      setResult(null)

      const res = await api.post('/ai/housing-search', {
        query: query.trim(),
      })

      setResult(res.data?.data || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to find matching housing')
    } finally {
      setLoading(false)
    }
  }

  const provider = result?.source || aiInfo?.provider || 'AI'
  const model =
    result?.model ||
    (aiInfo?.provider === 'groq'
      ? aiInfo.groqModel
      : aiInfo?.provider === 'gemini'
        ? aiInfo.geminiModel
        : aiInfo?.provider === 'mock'
          ? 'mock'
          : '')

  const filters = result?.filters || {}
  const housings = result?.housings || []

  return (
    <>
      <Navbar />

      <section className="bg-primary text-white py-4">
        <div className="container">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h2 className="fw-bold mb-1">AI Housing Assistant</h2>
              <p className="mb-0 opacity-75">Search Dormify listings using a normal student request.</p>
            </div>

            <div className="text-md-end">
              <span className={`badge ${sourceBadgeClass[provider] || 'bg-light text-primary'} px-3 py-2`}>
                {infoLoading ? 'Checking AI' : provider}
              </span>
              {model && <div className="small opacity-75 mt-1">{model}</div>}
            </div>
          </div>
        </div>
      </section>

      <main className="container py-4 py-lg-5">
        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Student request</label>
                    <textarea
                      className="form-control"
                      rows="6"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="I need a single room near the university under 150"
                      maxLength={500}
                    ></textarea>
                    <div className="d-flex justify-content-between mt-2">
                      <small className="text-muted">2 to 500 characters</small>
                      <small className="text-muted">{query.length}/500</small>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2 mb-4">
                    {examples.map((example) => (
                      <button
                        key={example}
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => handleExampleClick(example)}
                      >
                        {example}
                      </button>
                    ))}
                  </div>

                  {error && <div className="alert alert-danger small">{error}</div>}

                  <button type="submit" className="btn btn-primary w-100 fw-semibold" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Searching
                      </>
                    ) : (
                      <>
                        <i className="bi bi-stars me-2"></i>
                        Find Housings
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm rounded-3 mb-4">
              <div className="card-body p-4">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                  <div>
                    <h5 className="fw-bold mb-1">Smart matches</h5>
                    <p className="text-muted small mb-0">
                      {result ? result.summary : 'Matching filters and housing results will appear here.'}
                    </p>
                  </div>

                  {result && (
                    <span className="badge bg-primary px-3 py-2">
                      {result.resultsCount} found
                    </span>
                  )}
                </div>

                {result?.warning && <div className="alert alert-warning small mt-3 mb-0">{result.warning}</div>}

                {result && (
                  <div className="d-flex flex-wrap gap-2 mt-3">
                    {filters.room_type && (
                      <span className="badge bg-light text-dark border">{filterLabels[filters.room_type]}</span>
                    )}
                    {filters.maxPrice !== null && filters.maxPrice !== undefined && (
                      <span className="badge bg-light text-dark border">Under ${filters.maxPrice}</span>
                    )}
                    {filters.minPrice !== null && filters.minPrice !== undefined && (
                      <span className="badge bg-light text-dark border">From ${filters.minPrice}</span>
                    )}
                    {filters.gender_allowed && (
                      <span className="badge bg-light text-dark border">
                        {filterLabels[filters.gender_allowed]}
                      </span>
                    )}
                    {filters.nearUniversity && (
                      <span className="badge bg-light text-dark border">Near university</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted mt-3">Searching available housing...</p>
              </div>
            ) : result && housings.length === 0 ? (
              <div className="text-center py-5 bg-light rounded-3">
                <i className="bi bi-search display-1 text-muted"></i>
                <p className="text-muted mt-3 mb-0">No available housing matched this request.</p>
              </div>
            ) : housings.length > 0 ? (
              <div className="row g-4">
                {housings.map((housing) => (
                  <div key={housing.id} className="col-12 col-md-6 col-xl-4">
                    <HousingCard housing={housing} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-light rounded-3 p-5 text-center text-muted">
                <i className="bi bi-house-search fs-1 d-block mb-3"></i>
                <p className="mb-0">Start with a housing request.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default AiExplainPage
