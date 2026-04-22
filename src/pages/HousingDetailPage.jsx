import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axiosInstance";

function HousingDetailPage() {
  const { id } = useParams();

  const [housing, setHousing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    notes: "",
  });

  useEffect(() => {
    const fetchHousing = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/housings/${id}`);
        setHousing(res.data?.data || null);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load housing details");
      } finally {
        setLoading(false);
      }
    };

    fetchHousing();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    try {
      setBookingLoading(true);
      setError("");
      setSuccess("");

      await api.post("/bookings", {
        housing_id: Number(id),
        start_date: form.start_date,
        end_date: form.end_date,
        notes: form.notes,
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container py-5 text-center">Loading housing details...</div>
        <Footer />
      </>
    );
  }

  if (!housing) {
    return (
      <>
        <Navbar />
        <div className="container py-5 text-center text-danger">
          Housing not found
        </div>
        <Footer />
      </>
    );
  }

  const mainImage =
    housing?.HousingImages?.[0]?.image_url ||
    "https://via.placeholder.com/900x500?text=No+Image";

  return (
    <>
      <Navbar />

      <div className="container py-4">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm">
              <img
                src={mainImage}
                alt={housing.title}
                className="w-100"
                style={{ height: "420px", objectFit: "cover" }}
              />

              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                  <div>
                    <h2 className="fw-bold mb-1">{housing.title}</h2>
                    <p className="text-muted mb-0">
                      <i className="bi bi-geo-alt me-1"></i>
                      {housing.location}
                    </p>
                  </div>

                  <span
                    className={`badge ${
                      housing.status === "available" ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {housing.status}
                  </span>
                </div>

                <h4 className="text-primary fw-bold mb-3">${housing.price}</h4>

                <div className="row g-2 mb-4">
                  <div className="col-6 col-md-4">
                    <div className="border rounded p-2 small">
                      <strong>Room Type:</strong> {housing.room_type}
                    </div>
                  </div>

                  <div className="col-6 col-md-4">
                    <div className="border rounded p-2 small">
                      <strong>Gender:</strong> {housing.gender_allowed}
                    </div>
                  </div>

                  <div className="col-6 col-md-4">
                    <div className="border rounded p-2 small">
                      <strong>Available Rooms:</strong> {housing.available_rooms}
                    </div>
                  </div>
                </div>

                <h5 className="fw-bold">Description</h5>
                <p className="text-muted">{housing.description || "No description available"}</p>

                {housing.HousingImages?.length > 1 && (
                  <>
                    <h5 className="fw-bold mt-4">More Images</h5>
                    <div className="row g-3">
                      {housing.HousingImages.slice(1).map((img) => (
                        <div key={img.id} className="col-6 col-md-4">
                          <img
                            src={img.image_url}
                            alt="Housing"
                            className="w-100 rounded"
                            style={{ height: "140px", objectFit: "cover" }}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white fw-bold">Book This Housing</div>
              <div className="card-body">
                <form onSubmit={handleBooking}>
                  <div className="mb-3">
                    <label className="form-label">Start Date</label>
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
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      className="form-control"
                      value={form.end_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea
                      name="notes"
                      className="form-control"
                      rows="4"
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Add any notes..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={bookingLoading || housing.status !== "available"}
                  >
                    {bookingLoading
                      ? "Booking..."
                      : housing.status !== "available"
                      ? "Not Available"
                      : "Book Now"}
                  </button>
                </form>
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