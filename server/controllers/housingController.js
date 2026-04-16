const getAllHousings = async (req, res) => {
  res.json({ message: "all housings endpoint" });
};

const getHousingById = async (req, res) => {
  res.json({ message: "housing by id endpoint" });
};

module.exports = { getAllHousings, getHousingById };