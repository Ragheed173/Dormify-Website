const register = async (req, res) => {
  res.json({ message: "register endpoint" });
};

const login = async (req, res) => {
  res.json({ message: "login endpoint" });
};

const getMe = async (req, res) => {
  res.json({ message: "get me endpoint" });
};

module.exports = {
  register,
  login,
  getMe,
};