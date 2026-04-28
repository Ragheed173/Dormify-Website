import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HousingCard from '../components/HousingCard'
import SearchBar from '../components/SearchBar'
import api from '../api/axiosInstance'

function HomePage() {
  const [featuredHousings, setFeaturedHousings] = useState([])
  const [stats, setStats] = useState({
    usersCount: 0,
    housingsCount: 0,
    bookingsCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true)

        const [statsRes, featuredRes] = await Promise.all([
          api.get('/home/stats'),
          api.get('/home/featured-housings'),
        ])

        setStats(
          statsRes.data?.data || {
            usersCount: 0,
            housingsCount: 0,
            bookingsCount: 0,
          }
        )

        setFeaturedHousings(featuredRes.data?.data || [])
        setError('')
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load home data')
      } finally {
        setLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  const testimonials = [
    {
      name: 'Moayd Nasser',
      university: 'An-Najah University',
      text: 'Dormify made finding housing so easy! I found my perfect apartment in just 2 days.',
      avatar: 'LH',
    },
    {
      name: 'Hamzah Thuqan',
      university: 'An-Najah University',
      text: 'The best platform for student housing. Very organized and the support team is amazing!',
      avatar: 'OK',
    },
    {
      name: 'Ragheed Kamal',
      university: 'An-Najah University',
      text: 'I love how I can filter exactly what I need. Found great housing within my budget!',
      avatar: 'SN',
    },
  ]

  const steps = [
    {
      icon: 'bi-search',
      title: 'Search',
      desc: 'Browse thousands of verified student housing listings filtered by city, price, and type.',
      color: 'primary',
    },
    {
      icon: 'bi-calendar-check',
      title: 'Book',
      desc: 'Choose your perfect housing and confirm your booking with easy payment options.',
      color: 'success',
    },
    {
      icon: 'bi-house-door',
      title: 'Move In',
      desc: 'Get your booking confirmation and move into your new student home stress-free!',
      color: 'warning',
    },
  ]

  return (
    <>
      <Navbar />

      <section
        className="hero-gradient text-white py-5"
        style={{ minHeight: '520px', display: 'flex', alignItems: 'center' }}
      >
        <div className="container py-4">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <span className="badge bg-white text-primary mb-3 px-3 py-2">
                🎓 Trusted by students
              </span>
              <h1 className="display-4 fw-bold mb-3">
                Find Your Perfect
                <br />
                Student Housing
              </h1>
              <p className="lead mb-4 opacity-90">
                Thousands of verified housing options near your university.
                Search, book, and move in — all in one place.
              </p>
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-4 shadow-sm">
        <div className="container">
          <div className="row text-center g-3">
            {[
              { value: stats.usersCount, label: 'Registered Users' },
              { value: stats.housingsCount, label: 'Housing Units' },
              { value: stats.bookingsCount, label: 'Bookings Made' },
              { value: '4.8★', label: 'Average Rating' },
            ].map((stat) => (
              <div key={stat.label} className="col-6 col-md-3">
                <h3 className="fw-bold text-primary mb-0">{stat.value}</h3>
                <p className="text-muted small mb-0">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1">Featured Housing Units</h2>
              <p className="text-muted mb-0">
                Handpicked top-rated options for students
              </p>
            </div>
            <Link to="/listings" className="btn btn-outline-primary">
              View All <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading featured housing...</div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : featuredHousings.length > 0 ? (
            <div className="row g-4">
              {featuredHousings.map((housing) => (
                <div key={housing.id} className="col-12 col-md-6 col-lg-4">
                  <HousingCard housing={housing} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted">
              No featured housing available right now
            </div>
          )}
        </div>
      </section>

      <section className="py-5 bg-light" id="how-it-works">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">How It Works</h2>
            <p className="text-muted">3 simple steps to your new home</p>
          </div>
          <div className="row g-4 justify-content-center">
            {steps.map((step, idx) => (
              <div key={step.title} className="col-12 col-md-4 text-center">
                <div
                  className={`bg-${step.color} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`}
                  style={{ width: '80px', height: '80px' }}
                >
                  <i className={`bi ${step.icon} fs-2 text-${step.color}`}></i>
                </div>
                <div className={`badge bg-${step.color} rounded-pill mb-2`}>
                  Step {idx + 1}
                </div>
                <h5 className="fw-bold">{step.title}</h5>
                <p className="text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">What Students Say</h2>
            <p className="text-muted">Real experiences from real students</p>
          </div>
          <div className="row g-4">
            {testimonials.map((t) => (
              <div key={t.name} className="col-12 col-md-4">
                <div className="card h-100 border-0 shadow-sm p-4">
                  <div className="d-flex align-items-center mb-3 gap-3">
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                      style={{
                        width: '48px',
                        height: '48px',
                        fontSize: '14px',
                        flexShrink: 0,
                      }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0">{t.name}</h6>
                      <small className="text-muted">{t.university}</small>
                    </div>
                  </div>
                  <div className="text-warning mb-2">★★★★★</div>
                  <p className="text-muted fst-italic mb-0">"{t.text}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hero-gradient text-white py-5" id="about">
        <div className="container text-center">
          <h2 className="fw-bold mb-3">Are you a housing owner?</h2>
          <p className="lead mb-4 opacity-90">
            List your property on Dormify and reach thousands of students!
          </p>
          <Link to="/register" className="btn btn-light btn-lg text-primary fw-bold px-5">
            Get Started <i className="bi bi-arrow-right ms-2"></i>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default HomePage