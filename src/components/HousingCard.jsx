import { useNavigate } from 'react-router-dom'

function HousingCard({ housing }) {
  const navigate = useNavigate()

  return (
    <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ position: 'relative' }}>
        <img
          src={housing.image}
          alt={housing.title}
          className="housing-card-img w-100"
          style={{ height: '200px', objectFit: 'cover' }}
        />
        <span
          className="badge bg-primary position-absolute"
          style={{ bottom: '10px', right: '10px', fontSize: '13px', padding: '6px 10px' }}
        >
          ${housing.price}/night
        </span>
      </div>

      <div className="card-body d-flex flex-column p-3">
        <h6 className="card-title fw-bold mb-1">{housing.title}</h6>
        <p className="text-muted small mb-2">
          <i className="bi bi-geo-alt me-1"></i>
          {housing.city}, {housing.area}
        </p>

        <div className="d-flex flex-wrap gap-1 mb-3">
          <span className="badge bg-light text-dark border">
            <i className="bi bi-door-open me-1"></i>{housing.rooms} Rooms
          </span>
          <span className="badge bg-light text-dark border">
            <i className="bi bi-droplet me-1"></i>{housing.bathrooms} Bath
          </span>
          {housing.wifi && (
            <span className="badge bg-light text-dark border">
              <i className="bi bi-wifi me-1"></i>WiFi
            </span>
          )}
          {housing.ac && (
            <span className="badge bg-light text-dark border">
              <i className="bi bi-snow me-1"></i>AC
            </span>
          )}
        </div>

        {housing.rating && (
          <div className="d-flex align-items-center gap-1 mb-2">
            <i className="bi bi-star-fill text-warning small"></i>
            <span className="small fw-medium">{housing.rating}</span>
            <span className="text-muted small">({housing.reviews} reviews)</span>
          </div>
        )}

        <button
          className="btn btn-primary btn-sm mt-auto"
          onClick={() => navigate(`/housing/${housing.id}`)}
        >
          <i className="bi bi-eye me-1"></i>View Details
        </button>
      </div>
    </div>
  )
}

export default HousingCard