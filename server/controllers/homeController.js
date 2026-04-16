const getFeaturedHousings = async (req, res) => {
  res.json({ message: "featured housings endpoint" });
};

const getStats = async (req, res) => {
  res.json({ message: "stats endpoint" });
};

module.exports = {
  getFeaturedHousings,
  getStats,
};