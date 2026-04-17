import { useNavigate } from 'react-router-dom'

function HousingCard({ housing }) {
  const navigate = useNavigate()

  const imageUrl =
    housing?.HousingImages?.[0]?.image_url ||
    'https://via.placeholder.com/600x400?text=No+Image'

  return (
    <div
      className="card h-100 shadow-sm border-0"
      style={{ borderRadius: '12px', overflow: 'hidden' }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={imageUrl}
          alt={housing.title}
          className="housing-card-img w-100"
          style={{ height: '200px', objectFit: 'cover' }}
        />

        <span
          className={`badge position-absolute ${
            housing.status === 'available' ? 'bg-success' : 'bg-danger'
          }`}
          style={{
            top: '10px',
            right: '10px',
            fontSize: '13px',
            padding: '6px 10px',
          }}
        >
          {housing.status}
        </span>

        <span
          className="badge bg-primary position-absolute"
          style={{
            bottom: '10px',
            right: '10px',
            fontSize: '13px',
            padding: '6px 10px',
          }}
        >
          ${housing.price}
        </span>
      </div>

      <div className="card-body d-flex flex-column p-3">
        <h6 className="card-title fw-bold mb-1">{housing.title}</h6>

        <p className="text-muted small mb-2">
          <i className="bi bi-geo-alt me-1"></i>
          {housing.location}
        </p>

        <div className="d-flex flex-wrap gap-1 mb-3">
          <span className="badge bg-light text-dark border">
            <i className="bi bi-door-open me-1"></i>
            {housing.room_type}
          </span>

          <span className="badge bg-light text-dark border">
            <i className="bi bi-house-door me-1"></i>
            {housing.available_rooms} rooms
          </span>

          <span className="badge bg-light text-dark border">
            <i className="bi bi-people me-1"></i>
            {housing.gender_allowed}
          </span>
        </div>

        {housing.description && (
          <p className="text-muted small mb-3">
            {housing.description.length > 80
              ? `${housing.description.slice(0, 80)}...`
              : housing.description}
          </p>
        )}

        <button
          className="btn btn-primary btn-sm mt-auto"
          onClick={() => navigate(`/housing/${housing.id}`)}
        >
          <i className="bi bi-eye me-1"></i>
          View Details
        </button>
      </div>
    </div>
  )
}

export default HousingCard