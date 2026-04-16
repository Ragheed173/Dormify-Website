const getProfile = async (req, res) => {
  res.json({ message: "student profile endpoint" });
};

const updateProfile = async (req, res) => {
  res.json({ message: "update student profile endpoint" });
};

const getMyBookings = async (req, res) => {
  res.json({ message: "student bookings endpoint" });
};

const getMyBookingById = async (req, res) => {
  res.json({ message: "student booking by id endpoint" });
};

const cancelBooking = async (req, res) => {
  res.json({ message: "cancel booking endpoint" });
};

module.exports = {
  getProfile,
  updateProfile,
  getMyBookings,
  getMyBookingById,
  cancelBooking,
};