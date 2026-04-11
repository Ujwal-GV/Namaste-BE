const location = require("../models/location");

exports.getLocations = async (req, res) => {
  try {
    const locations = await location.find().sort({ name: 1 });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};