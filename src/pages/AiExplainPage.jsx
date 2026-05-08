import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../api/axiosInstance'
import { validateAiExplainForm } from '../utils/validation'

const examples = [
  'what JWT is',
  'how booking status works',
  'what an HTTP request is',
]

const sourceBadgeClass = {
  groq: 'bg-success',
  gemini: 'bg-primary',
  mock: 'bg-secondary',
}

function AiExplainPage() {
  const [topic, setTopic] = useState('')
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
    setTopic(value)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validateAiExplainForm({ topic })
    if (validationError) {
      setError(validationError)
      setResult(null)
      return
    }

    try {
      setLoading(true)
      setError('')
      setResult(null)

      const res = await api.post('/ai/explain', {
        topic: topic.trim(),
      })

      setResult(res.data?.data || null)
    } catch (err) {
      setError(
        err.response?.data?.hint ||
          err.response?.data?.message ||
          'Failed to generate explanation'
      )
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

  return (
    <>
      <Navbar />

      <section className="bg-primary text-white py-4">
        <div className="container">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h2 className="fw-bold mb-1">AI Explain</h2>
              <p className="mb-0 opacity-75">Get short plain-language explanations for study topics.</p>
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
        <div className="row g-4 justify-content-center">
          <div className="col-12 col-lg-5">
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Topic</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Example: what JWT is"
                      maxLength={500}
                    ></textarea>
                    <div className="d-flex justify-content-between mt-2">
                      <small className="text-muted">2 to 500 characters</small>
                      <small className="text-muted">{topic.length}/500</small>
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
                        Generating
                      </>
                    ) : (
                      <>
                        <i className="bi bi-stars me-2"></i>
                        Explain
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-7">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                  <div>
                    <h5 className="fw-bold mb-1">Explanation</h5>
                    <p className="text-muted small mb-0">
                      {result ? result.topic : 'Your answer will appear here.'}
                    </p>
                  </div>

                  {result?.source && (
                    <span className={`badge ${sourceBadgeClass[result.source] || 'bg-secondary'} text-capitalize`}>
                      {result.source}
                    </span>
                  )}
                </div>

                {result ? (
                  <>
                    <p className="mb-4" style={{ lineHeight: '1.8' }}>
                      {result.explanation}
                    </p>

                    <div className="border-top pt-3 small text-muted">
                      <i className="bi bi-cpu me-2"></i>
                      {result.model || 'model unavailable'}
                    </div>
                  </>
                ) : (
                  <div className="bg-light rounded-3 p-4 text-center text-muted">
                    <i className="bi bi-chat-square-text fs-1 d-block mb-3"></i>
                    <p className="mb-0">Write a topic and press Explain.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default AiExplainPage
