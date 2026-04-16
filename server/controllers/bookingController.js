const createBooking = async (req, res) => {
  res.json({ message: "create booking endpoint" });
};

const getBookingById = async (req, res) => {
  res.json({ message: "get booking by id endpoint" });
};

const updateBookingStatus = async (req, res) => {
  res.json({ message: "update booking status endpoint" });
};

const deleteBooking = async (req, res) => {
  res.json({ message: "delete booking endpoint" });
};

module.exports = {
  createBooking,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
};