import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { validateBookingForm } from "../utils/validation";
import { resolveImageUrl } from "../utils/imageUrl";

function HousingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [housing, setHousing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    notes: "",
  });

  const token = localStorage.getItem("token");
  const role = user?.role || "student";

  useEffect(() => {
    const fetchHousing = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/housings/${id}`);
        const housingData = res.data?.data || null;

        setHousing(housingData);

        const firstImage = resolveImageUrl(
          housingData?.HousingImages?.[0]?.image_url ||
            "https://via.placeholder.com/1200x700?text=No+Image"
        );
        setSelectedImage(firstImage);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load housing details");
      } finally {
        setLoading(false);
      }
    };

    fetchHousing();
  }, [id]);

  const images = useMemo(() => {
    if (!housing?.HousingImages?.length) {
      return ["https://via.placeholder.com/1200x700?text=No+Image"];
    }
    return housing.HousingImages.map((img) => resolveImageUrl(img.image_url));
  }, [housing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const startDate = form.start_date || formData.get("start_date") || "";
    const endDate = form.end_date || formData.get("end_date") || "";
    const notes = form.notes || formData.get("notes") || "";

    if (!token) {
      navigate("/login");
      return;
    }

    const validationError = validateBookingForm({
      start_date: startDate,
      end_date: endDate,
      notes,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setBookingLoading(true);
      setError("");
      setSuccess("");

      await api.post("/bookings", {
        housing_id: Number(id),
        start_date: startDate,
        end_date: endDate,
        notes,
      });

      setSuccess("Booking created successfully");
      setForm({
        start_date: "",
        end_date: "",
        notes: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  };

  const statusClass =
    housing?.status === "available" ? "bg-success" : "bg-danger";

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted mb-0">Loading housing details...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error && !housing) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger">{error}</div>
          <Link to="/listings" className="btn btn-outline-primary">
            Back to Listings
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <section className="bg-primary text-white py-4">
        <div className="container">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <p className="mb-1 small opacity-75">
                <Link to="/" className="text-white text-decoration-none">
                  Home
                </Link>{" "}
                /{" "}
                <Link to="/listings" className="text-white text-decoration-none">
                  Listings
                </Link>{" "}
                / Details
              </p>
              <h2 className="fw-bold mb-1">{housing?.title}</h2>
              <p className="mb-0 opacity-75">
                <i className="bi bi-geo-alt me-1"></i>
                {housing?.location}
              </p>
            </div>

            <div className="text-end">
              <span className={`badge ${statusClass} px-3 py-2 text-capitalize`}>
                {housing?.status}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-4 py-lg-5">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
              <div className="overflow-hidden" style={{ borderRadius: "16px 16px 0 0" }}>
                <img
                  src={selectedImage}
                  alt={housing?.title}
                  className="w-100"
                  style={{ height: "460px", objectFit: "cover" }}
                />
              </div>

              <div className="card-body p-3 p-md-4">
                <div className="row g-3">
                  {images.map((img, index) => (
                    <div key={index} className="col-4 col-md-3">
                      <img
                        src={img}
                        alt={`Housing ${index + 1}`}
                        className={`w-100 border ${
                          selectedImage === img ? "border-primary border-3" : "border-light"
                        }`}
                        style={{
                          height: "90px",
                          objectFit: "cover",
                          borderRadius: "10px",
                          cursor: "pointer",
                        }}
                        onClick={() => setSelectedImage(img)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm" style={{ borderRadius: "16px" }}>
              <div className="card-body p-4">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                  <div>
                    <h3 className="fw-bold mb-2">{housing?.title}</h3>
                    <p className="text-muted mb-0">
                      <i className="bi bi-geo-alt me-1"></i>
                      {housing?.location}
                    </p>
                  </div>

                  <div className="text-lg-end">
                    <h3 className="fw-bold text-primary mb-0">${housing?.price}</h3>
                    <small className="text-muted">per stay</small>
                  </div>
                </div>

                <div className="row g-2 mb-4">
                  <div className="col-6 col-md-3">
                    <div className="border rounded-3 p-3 h-100 bg-light">
                      <div className="small text-muted mb-1">Room Type</div>
                      <div className="fw-semibold text-capitalize">{housing?.room_type}</div>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="border rounded-3 p-3 h-100 bg-light">
                      <div className="small text-muted mb-1">Gender</div>
                      <div className="fw-semibold text-capitalize">
                        {housing?.gender_allowed}
                      </div>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="border rounded-3 p-3 h-100 bg-light">
                      <div className="small text-muted mb-1">Available Rooms</div>
                      <div className="fw-semibold">{housing?.available_rooms}</div>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="border rounded-3 p-3 h-100 bg-light">
                      <div className="small text-muted mb-1">Status</div>
                      <div className="fw-semibold text-capitalize">{housing?.status}</div>
                    </div>
                  </div>
                </div>

                <h5 className="fw-bold mb-3">Description</h5>
                <p className="text-muted mb-0" style={{ lineHeight: "1.8" }}>
                  {housing?.description || "No description available for this housing."}
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div
              className="card border-0 shadow-sm position-sticky"
              style={{ top: "90px", borderRadius: "16px" }}
            >

              <div className="card-body p-4">
                {canBook ? (
                  <>
                    <div className="mb-4">
                      <h4 className="fw-bold mb-1">Book this housing</h4>
                      <p className="text-muted small mb-0">
                        Choose your dates and send your booking request.
                      </p>
                    </div>

                    {!token && (
                      <div className="alert alert-warning small">
                        You need to{" "}
                        <Link to="/login" className="fw-semibold">
                          log in
                        </Link>{" "}
                        before booking.
                      </div>
                    )}

                    <form onSubmit={handleBooking}>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      className="form-control"
                      value={form.start_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium">End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      className="form-control"
                      value={form.end_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium">Notes</label>
                    <textarea
                      name="notes"
                      className="form-control"
                      rows="4"
                      placeholder="Write any notes for the booking..."
                      value={form.notes}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-bold"
                    disabled={bookingLoading || housing?.status !== "available"}
                  >
                    {bookingLoading
                      ? "Booking..."
                      : housing?.status !== "available"
                      ? "Not Available"
                      : "Book Now"}
                  </button>
                </form>
                <hr className="my-4" />
                  </>
                ) : (
                  <div className="mb-4">
                    <h4 className="fw-bold mb-1">Housing details</h4>
                    <p className="text-muted small mb-0">
                      Booking is available to students only. Manage booking requests from your dashboard.
                    </p>
                  </div>
                )}

                <hr className="my-4" />

                <div className="small text-muted">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Price</span>
                    <span className="fw-semibold text-dark">${housing?.price}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Room Type</span>
                    <span className="fw-semibold text-dark text-capitalize">
                      {housing?.room_type}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Available Rooms</span>
                    <span className="fw-semibold text-dark">
                      {housing?.available_rooms}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default HousingDetailPage;