const getDashboardStats = async (req, res) => {
  res.json({ message: "admin dashboard endpoint" });
};

const getAllUsers = async (req, res) => {
  res.json({ message: "all users endpoint" });
};

const getUserById = async (req, res) => {
  res.json({ message: "user by id endpoint" });
};

const updateUser = async (req, res) => {
  res.json({ message: "update user endpoint" });
};

const deleteUser = async (req, res) => {
  res.json({ message: "delete user endpoint" });
};

const createHousing = async (req, res) => {
  res.json({ message: "create housing endpoint" });
};

const updateHousing = async (req, res) => {
  res.json({ message: "update housing endpoint" });
};

const deleteHousing = async (req, res) => {
  res.json({ message: "delete housing endpoint" });
};

const getAllBookings = async (req, res) => {
  res.json({ message: "all bookings endpoint" });
};

const updateBookingStatus = async (req, res) => {
  res.json({ message: "admin update booking status endpoint" });
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createHousing,
  updateHousing,
  deleteHousing,
  getAllBookings,
  updateBookingStatus,
};