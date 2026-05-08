import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HousingCard from '../components/HousingCard'
import api from '../api/axiosInstance'
import { validateHousingFilters } from '../utils/validation'

function ListingsPage() {
  const [housings, setHousings] = useState([])
  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
    pageSize: 6,
  })

  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    gender_allowed: '',
    room_type: '',
    status: '',
  })

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchHousings = async () => {
      const validationError = validateHousingFilters(filters)
      if (validationError) {
        setHousings([])
        setPagination({
          totalItems: 0,
          currentPage: 1,
          totalPages: 1,
          pageSize: 6,
        })
        setError(validationError)
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        const params = {
          page,
          limit: 6,
        }

        if (filters.search) params.search = filters.search
        if (filters.minPrice) params.minPrice = filters.minPrice
        if (filters.maxPrice) params.maxPrice = filters.maxPrice
        if (filters.gender_allowed) params.gender_allowed = filters.gender_allowed
        if (filters.room_type) params.room_type = filters.room_type
        if (filters.status) params.status = filters.status

        const res = await api.get('/housings', { params })

        setHousings(res.data?.data || [])
        setPagination(
          res.data?.pagination || {
            totalItems: 0,
            currentPage: 1,
            totalPages: 1,
            pageSize: 6,
          }
        )
        setError('')
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch housings')
      } finally {
        setLoading(false)
      }
    }

    fetchHousings()
  }, [filters, page])

  const handleChange = (e) => {
    const { name, value } = e.target
    setPage(1)
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      minPrice: '',
      maxPrice: '',
      gender_allowed: '',
      room_type: '',
      status: '',
    })
    setPage(1)
  }

  return (
    <>
      <Navbar />

      <div className="bg-primary text-white py-4">
        <div className="container">
          <h2 className="fw-bold mb-1">Available Housing Units</h2>
          <p className="mb-0 opacity-75">Browse and filter to find your perfect match</p>
        </div>
      </div>

      <div className="container py-4">
        <div className="mb-4">
          <div className="input-group shadow-sm">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by title or location..."
              name="search"
              value={filters.search}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-3">
            <div className="card border-0 shadow-sm p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">
                  <i className="bi bi-funnel me-2"></i>Filters
                </h6>
                <button
                  className="btn btn-link btn-sm text-danger p-0"
                  onClick={resetFilters}
                >
                  Reset
                </button>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-medium">Price Range</label>
                <div className="row g-2">
                  <div className="col">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Min"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Max"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-medium">Gender</label>
                <select
                  className="form-select form-select-sm"
                  name="gender_allowed"
                  value={filters.gender_allowed}
                  onChange={handleChange}
                >
                  <option value="">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-medium">Room Type</label>
                <select
                  className="form-select form-select-sm"
                  name="room_type"
                  value={filters.room_type}
                  onChange={handleChange}
                >
                  <option value="">All</option>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                </select>
              </div>

              <div className="mb-1">
                <label className="form-label small fw-medium">Status</label>
                <select
                  className="form-select form-select-sm"
                  name="status"
                  value={filters.status}
                  onChange={handleChange}
                >
                  <option value="">All</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <span className="text-muted small">
                <strong>{pagination.totalItems}</strong> results found
              </span>

              {pagination.totalPages > 1 && (
                <span className="text-muted small">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              )}
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted mt-3">Loading housing...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : housings.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-search display-1 text-muted"></i>
                <p className="text-muted mt-3">No housing found matching your filters.</p>
                <button className="btn btn-outline-primary" onClick={resetFilters}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="row g-4">
                  {housings.map((housing) => (
                    <div key={housing.id} className="col-12 col-md-6 col-xl-4">
                      <HousingCard housing={housing} />
                    </div>
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="d-flex justify-content-center align-items-center gap-2 mt-4 flex-wrap">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      disabled={page === 1}
                      onClick={() => setPage((prev) => prev - 1)}
                    >
                      <i className="bi bi-arrow-left me-1"></i>Previous
                    </button>

                    <span className="small text-muted">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>

                    <button
                      className="btn btn-outline-primary btn-sm"
                      disabled={page === pagination.totalPages}
                      onClick={() => setPage((prev) => prev + 1)}
                    >
                      Next<i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default ListingsPage
