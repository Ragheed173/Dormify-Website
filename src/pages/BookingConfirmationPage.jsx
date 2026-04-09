import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { mockHousings } from '../api/mockData'
import { useAuth } from '../context/AuthContext'

// ==============================
// صفحة تأكيد الحجز
// ==============================
function BookingConfirmationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [housing, setHousing] = useState(null)
  const [roomType, setRoomType] = useState('single')
  const [nights, setNights] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' })
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const found = mockHousings.find((h) => h.id === parseInt(id))
    setHousing(found)
    window.scrollTo(0, 0)
  }, [id])

  // حساب السعر حسب نوع الغرفة
  const getRoomPrice = () => {
    if (!housing) return 0
    if (roomType === 'single') return housing.price * 0.6
    if (roomType === 'double') return housing.price * 0.8
    return housing.price
  }

  const roomPrice = getRoomPrice()
  const subtotal  = roomPrice * nights
  const tax       = subtotal * 0.08
  const total     = subtotal + tax

  const handleConfirm = () => {
    setLoading(true)
    // استبدل بـ api.post('/bookings') عند ربط الباك ايند
    setTimeout(() => {
      setLoading(false)
      setConfirmed(true)
      setTimeout(() => navigate('/student/dashboard'), 2500)
    }, 1500)
  }

  if (!housing) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary"></div>
    </div>
  )

  // ===== شاشة النجاح =====
  if (confirmed) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <div className="display-1 text-success mb-3">✓</div>
        <h2 className="fw-bold">Booking Confirmed!</h2>
        <p className="text-muted">Redirecting to your dashboard...</p>
        <div className="spinner-border text-primary mt-2"></div>
      </div>
    </div>
  )

  return (
    <>
      <Navbar />
      <div className="bg-primary text-white py-4">
        <div className="container">
          <h2 className="fw-bold mb-0">Confirm Your Booking</h2>
          <p className="mb-0 opacity-75">{housing.title} — {housing.city}</p>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-4">

          {/* ===== القسم الأيسر – تفاصيل السكن ===== */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm p-3">
              <h6 className="fw-bold mb-3"><i className="bi bi-house-door me-2 text-primary"></i>Booking Details</h6>
              <img src={housing.image} alt={housing.title}
                className="w-100 rounded-2 mb-3" style={{ height: '180px', objectFit: 'cover' }} />
              <h6 className="fw-bold mb-1">{housing.title}</h6>
              <p className="text-muted small mb-2">
                <i className="bi bi-geo-alt me-1"></i>{housing.city}, {housing.area}
              </p>
              <div className="d-flex gap-2 flex-wrap">
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
              </div>
              <hr />
              <button className="btn btn-outline-primary btn-sm w-100"
                onClick={() => navigate(`/housing/${id}`)}>
                <i className="bi bi-eye me-1"></i>View Full Details
              </button>
            </div>
          </div>

          {/* ===== القسم الأوسط – الغرفة والسعر ===== */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm p-3">
              <h6 className="fw-bold mb-3"><i className="bi bi-calendar3 me-2 text-primary"></i>Room & Price</h6>

              {/* اختيار نوع الغرفة */}
              <div className="mb-3">
                <label className="form-label small fw-medium">Room Type</label>
                {[
                  { value: 'single', label: 'Single Room',  price: housing.price * 0.6 },
                  { value: 'double', label: 'Double Room',  price: housing.price * 0.8 },
                  { value: 'master', label: 'Master Room',  price: housing.price },
                ].map((r) => (
                  <div
                    key={r.value}
                    className={`d-flex justify-content-between align-items-center p-2 rounded-2 mb-2 border ${roomType === r.value ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setRoomType(r.value)}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <input type="radio" readOnly checked={roomType === r.value} />
                      <span className="small fw-medium">{r.label}</span>
                    </div>
                    <span className="text-primary fw-bold small">${r.price.toFixed(0)}/night</span>
                  </div>
                ))}
              </div>

              {/* عدد الليالي */}
              <div className="mb-3">
                <label className="form-label small fw-medium">Number of Nights</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  max="365"
                  value={nights}
                  onChange={(e) => setNights(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>

              <hr />

              {/* تفصيل السعر */}
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">${roomPrice.toFixed(0)} × {nights} night{nights > 1 ? 's' : ''}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between small mb-2">
                <span className="text-muted">Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold border-top pt-2">
                <span>Total</span>
                <span className="text-primary fs-5">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* ===== القسم الأيمن – تأكيد الحجز ===== */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm p-3">
              <h6 className="fw-bold mb-3"><i className="bi bi-check-circle me-2 text-primary"></i>Confirm Booking</h6>

              {/* معلومات الطالب */}
              <div className="bg-light rounded-2 p-3 mb-3 small">
                <p className="mb-1"><strong>Name:</strong> {user?.name}</p>
                <p className="mb-1"><strong>Email:</strong> {user?.email}</p>
                <p className="mb-0"><strong>Phone:</strong> +970 59 000 0000</p>
              </div>

              {/* طريقة الدفع */}
              <div className="mb-3">
                <label className="form-label small fw-medium">Payment Method</label>
                {[
                  { value: 'cash',   label: 'Cash on Arrival',   icon: 'bi-cash-stack' },
                  { value: 'online', label: 'Online (Card)',      icon: 'bi-credit-card' },
                ].map((m) => (
                  <div
                    key={m.value}
                    className={`d-flex align-items-center gap-2 p-2 rounded-2 border mb-2 ${paymentMethod === m.value ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setPaymentMethod(m.value)}
                  >
                    <input type="radio" readOnly checked={paymentMethod === m.value} />
                    <i className={`bi ${m.icon} ${paymentMethod === m.value ? 'text-primary' : 'text-muted'}`}></i>
                    <span className="small fw-medium">{m.label}</span>
                  </div>
                ))}
              </div>

              {/* بيانات البطاقة (إذا اختار أونلاين) */}
              {paymentMethod === 'online' && (
                <div className="mb-3">
                  <input type="text" className="form-control form-control-sm mb-2"
                    placeholder="Card Number (1234 5678 9012 3456)"
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: e.target.value })} />
                  <div className="row g-2">
                    <div className="col">
                      <input type="text" className="form-control form-control-sm"
                        placeholder="MM/YY"
                        value={card.expiry}
                        onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
                    </div>
                    <div className="col">
                      <input type="text" className="form-control form-control-sm"
                        placeholder="CVV"
                        value={card.cvv}
                        onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              {/* زر التأكيد */}
              <button
                className="btn btn-success w-100 py-2 fw-bold"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
                ) : (
                  <><i className="bi bi-check-circle me-2"></i>Confirm Booking — ${total.toFixed(2)}</>
                )}
              </button>

              <p className="text-muted text-center small mt-2 mb-0">
                <i className="bi bi-lock-fill me-1"></i>Secure & encrypted
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default BookingConfirmationPage
