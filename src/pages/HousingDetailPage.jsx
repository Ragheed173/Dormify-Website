import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { mockHousings } from '../api/mockData'
import { useAuth } from '../context/AuthContext'

function HousingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [housing, setHousing] = useState(null)
  const [activeImg, setActiveImg] = useState(0)
  const [selectedRoom, setSelectedRoom] = useState('single')

  useEffect(() => {
    const found = mockHousings.find((h) => h.id === parseInt(id))
    setHousing(found)
    window.scrollTo(0, 0)
  }, [id])

  const handleBookNow = () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'student') {
      alert('Only students can book housing.')
      return
    }
    navigate(`/booking/confirm/${id}`)
  }

  if (!housing) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary"></div>
      </div>
    )
  }

  const amenities = [
    { icon: 'bi-wifi', label: 'WiFi', active: housing.wifi },
    { icon: 'bi-p-square', label: 'Parking', active: housing.parking },
    { icon: 'bi-snow', label: 'Air Conditioning', active: housing.ac },
    { icon: 'bi-house-gear', label: 'Furnished', active: housing.furnished },
    { icon: 'bi-droplet', label: 'Bathrooms', active: true },
    { icon: 'bi-shield-check', label: '24/7 Security', active: true },
  ]

  return (
    <>
      <Navbar />

      <div className="container py-5">
        <button className="btn btn-outline-secondary btn-sm mb-4" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-1"></i> Back to Listings
        </button>

        <div className="row g-4">
          <div className="col-lg-8">
            <img
              src={housing.images[activeImg]}
              alt={housing.title}
              className="w-100 rounded-3 shadow-sm mb-2"
              style={{ height: '380px', objectFit: 'cover' }}
            />
            <div className="d-flex gap-2 mb-4">
              {housing.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`view-${idx}`}
                  className={`rounded-2 cursor-pointer border ${activeImg === idx ? 'border-primary border-2' : ''}`}
                  style={{ width: '80px', height: '60px', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => setActiveImg(idx)}
                />
              ))}
            </div>

            <div className="d-flex justify-content-between align-items-start mb-2">
              <h2 className="fw-bold">{housing.title}</h2>
              <div className="text-warning fs-5">
                <i className="bi bi-star-fill"></i>
                <span className="text-dark ms-1 fw-bold">{housing.rating}</span>
                <small className="text-muted">({housing.reviews})</small>
              </div>
            </div>
            <p className="text-muted mb-3">
              <i className="bi bi-geo-alt-fill text-primary me-1"></i>
              {housing.city}, {housing.area}
            </p>

            <hr />

            <h5 className="fw-bold mb-2">About this housing</h5>
            <p className="text-muted">{housing.description}</p>

            <h5 className="fw-bold mb-3 mt-4">Amenities</h5>
            <div className="row g-2">
              {amenities.map((a) => (
                <div key={a.label} className="col-6 col-md-4">
                  <div className={`d-flex align-items-center gap-2 p-2 rounded-2 ${a.active ? 'bg-success bg-opacity-10 text-success' : 'bg-light text-muted'}`}>
                    <i className={`bi ${a.icon}`}></i>
                    <span className="small">{a.label}</span>
                    {a.active && <i className="bi bi-check-circle-fill ms-auto small"></i>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow p-4 sticky-top" style={{ top: '80px' }}>
              <h4 className="fw-bold text-primary mb-1">${housing.price}<small className="text-muted fs-6 fw-normal">/night</small></h4>
              <p className="text-muted small mb-3">
                <i className="bi bi-door-open me-1"></i>{housing.rooms} Rooms Â·
                <i className="bi bi-droplet ms-2 me-1"></i>{housing.bathrooms} Bath
              </p>

              <hr />

              <h6 className="fw-bold mb-2">Select Room Type</h6>
              {[
                { value: 'single', label: 'Single Room', price: housing.price * 0.6 },
                { value: 'double', label: 'Double Room', price: housing.price * 0.8 },
                { value: 'master', label: 'Master Room', price: housing.price },
              ].map((r) => (
                <div
                  key={r.value}
                  className={`d-flex justify-content-between align-items-center p-2 rounded-2 mb-2 border ${selectedRoom === r.value ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedRoom(r.value)}
                >
                  <div className="d-flex align-items-center gap-2">
                    <input type="radio" checked={selectedRoom === r.value} onChange={() => setSelectedRoom(r.value)} />
                    <span className="small fw-medium">{r.label}</span>
                  </div>
                  <span className="text-primary fw-bold small">${r.price.toFixed(0)}/night</span>
                </div>
              ))}

              <hr />

              <button className="btn btn-primary w-100 py-2 fw-bold" onClick={handleBookNow}>
                <i className="bi bi-calendar-check me-2"></i>Book Now
              </button>
              <p className="text-muted text-center small mt-2 mb-0">
                <i className="bi bi-shield-check me-1 text-success"></i>
                Free cancellation within 24 hours
              </p>

              <hr />

              <div className="d-flex align-items-center gap-2">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: '40px', height: '40px', fontSize: '12px' }}>
                  KO
                </div>
                <div>
                  <p className="mb-0 small fw-bold">{housing.owner}</p>
                  <p className="mb-0 small text-muted">Property Owner</p>
                </div>
                <button className="btn btn-outline-primary btn-sm ms-auto">
                  <i className="bi bi-chat-dots me-1"></i>Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default HousingDetailPage