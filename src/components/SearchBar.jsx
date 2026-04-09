import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function SearchBar({ onSearch, compact = false }) {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    city: '',
    type: '',
    priceRange: '',
  })

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleSearch = () => {
    if (onSearch) {
      onSearch(filters)
    } else {
      navigate('/listings')
    }
  }

  return (
    <div className={`bg-white rounded-3 shadow p-${compact ? '2' : '3'}`}>
      <div className="row g-2 align-items-center">
        <div className="col-12 col-md">
          <select
            name="city"
            className="form-select"
            value={filters.city}
            onChange={handleChange}
          >
            <option value="">City / Area</option>
            <option value="Ramallah">Ramallah</option>
            <option value="Nablus">Nablus</option>
            <option value="Hebron">Hebron</option>
            <option value="Jenin">Jenin</option>
            <option value="Tulkarm">Tulkarm</option>
            <option value="Qalqilya">Qalqilya</option>
          </select>
        </div>

        <div className="col-12 col-md">
          <select
            name="type"
            className="form-select"
            value={filters.type}
            onChange={handleChange}
          >
            <option value="">Housing Type</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="room">Single Room</option>
            <option value="studio">Studio</option>
            <option value="shared">Shared Housing</option>
          </select>
        </div>

        <div className="col-12 col-md">
          <select
            name="priceRange"
            className="form-select"
            value={filters.priceRange}
            onChange={handleChange}
          >
            <option value="">Price Range</option>
            <option value="0-100">$0 – $100</option>
            <option value="100-200">$100 – $200</option>
            <option value="200-350">$200 – $350</option>
            <option value="350+">$350+</option>
          </select>
        </div>

        <div className="col-12 col-md-auto">
          <button
            className={`btn btn-primary w-100 ${compact ? '' : 'px-4'}`}
            onClick={handleSearch}
          >
            <i className="bi bi-search me-2"></i>Search
          </button>
        </div>
      </div>
    </div>
  )
}

export default SearchBar
