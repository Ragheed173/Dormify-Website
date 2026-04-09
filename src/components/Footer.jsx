import { Link } from 'react-router-dom'

// ==============================
// الفوتر
// ==============================
function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-3 mt-5">
      <div className="container">
        <div className="row g-4">
          {/* اللوقو والوصف */}
          <div className="col-lg-4">
            <h5 className="fw-bold text-primary mb-3">
              <i className="bi bi-house-heart-fill me-2"></i>Dormify
            </h5>
            <p className="text-secondary small">
              The smart platform that connects university students with verified housing.
              Find your perfect home away from home.
            </p>
            {/* أيقونات السوشيال ميديا */}
            <div className="d-flex gap-3 mt-3">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map((s) => (
                <a key={s} href="#" className="text-secondary fs-5 hover-white">
                  <i className={`bi bi-${s}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* روابط سريعة */}
          <div className="col-6 col-lg-2">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              {[
                { label: 'Home', to: '/' },
                { label: 'Search', to: '/listings' },
                { label: 'Login', to: '/login' },
                { label: 'Register', to: '/register' },
              ].map((l) => (
                <li key={l.label} className="mb-1">
                  <Link to={l.to} className="text-secondary text-decoration-none small">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* الشركة */}
          <div className="col-6 col-lg-2">
            <h6 className="fw-bold mb-3">Company</h6>
            <ul className="list-unstyled">
              {['About Us', 'Contact', 'Privacy Policy', 'Terms of Use'].map((item) => (
                <li key={item} className="mb-1">
                  <a href="#" className="text-secondary text-decoration-none small">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* تواصل معنا */}
          <div className="col-lg-4">
            <h6 className="fw-bold mb-3">Contact Us</h6>
            <p className="text-secondary small mb-1">
              <i className="bi bi-envelope me-2"></i>info@dormify.com
            </p>
            <p className="text-secondary small mb-1">
              <i className="bi bi-telephone me-2"></i>+970 59 000 0000
            </p>
            <p className="text-secondary small">
              <i className="bi bi-geo-alt me-2"></i>Palestine, West Bank
            </p>
          </div>
        </div>

        <hr className="border-secondary mt-4" />
        <p className="text-center text-secondary small mb-0">
          © {new Date().getFullYear()} Dormify. All rights reserved. Built for CS students 🎓
        </p>
      </div>
    </footer>
  )
}

export default Footer
