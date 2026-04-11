import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HousingCard from '../components/HousingCard'
import { mockHousings } from '../api/mockData'

function ListingsPage() {
  const [housings, setHousings] = useState([])
  const [filtered, setFiltered] = useState([])
  const [filters, setFilters] = useState({
    city: '',
    minPrice: '',
    maxPrice: '',
    rooms: '',
    wifi: false,
    search: '',
  })

  useEffect(() => {
    setHousings(mockHousings)
    setFiltered(mockHousings)
  }, [])

  useEffect(() => {
    let result = [...housings]

    if (filters.city)     result = result.filter((h) => h.city === filters.city)
    if (filters.rooms)    result = result.filter((h) => h.rooms >= parseInt(filters.rooms))
    if (filters.minPrice) result = result.filter((h) => h.price >= parseInt(filters.minPrice))
    if (filters.maxPrice) result = result.filter((h) => h.price <= parseInt(filters.maxPrice))
    if (filters.wifi)     result = result.filter((h) => h.wifi === true)
    if (filters.search)   result = result.filter((h) =>
      h.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      h.city.toLowerCase().includes(filters.search.toLowerCase())
    )

    setFiltered(result)
  }, [filters, housings])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFilters((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const resetFilters = () => {
    setFilters({ city: '', minPrice: '', maxPrice: '', rooms: '', wifi: false, search: '' })
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
              placeholder="Search by title or city..."
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
                <h6 className="fw-bold mb-0"><i className="bi bi-funnel me-2"></i>Filters</h6>
                <button className="btn btn-link btn-sm text-danger p-0" onClick={resetFilters}>Reset</button>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-medium">City</label>
                <select className="form-select form-select-sm" name="city" value={filters.city} onChange={handleChange}>
                  <option value="">All Cities</option>
                  {['Ramallah', 'Nablus', 'Hebron', 'Jenin'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-medium">Price Range ($/night)</label>
                <div className="row g-2">
                  <div className="col">
                    <input type="number" className="form-control form-control-sm" placeholder="Min"
                      name="minPrice" value={filters.minPrice} onChange={handleChange} />
                  </div>
                  <div className="col">
                    <input type="number" className="form-control form-control-sm" placeholder="Max"
                      name="maxPrice" value={filters.maxPrice} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-medium">Min. Rooms</label>
                <select className="form-select form-select-sm" name="rooms" value={filters.rooms} onChange={handleChange}>
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="wifi"
                  name="wifi" checked={filters.wifi} onChange={handleChange} />
                <label className="form-check-label small" htmlFor="wifi">
                  <i className="bi bi-wifi me-1"></i>WiFi Included
                </label>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted small">
                <strong>{filtered.length}</strong> results found
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-search display-1 text-muted"></i>
                <p className="text-muted mt-3">No housing found matching your filters.</p>
                <button className="btn btn-outline-primary" onClick={resetFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="row g-4">
                {filtered.map((housing) => (
                  <div key={housing.id} className="col-12 col-md-6 col-xl-4">
                    <HousingCard housing={housing} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default ListingsPage