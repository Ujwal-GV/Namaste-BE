const mongoose = require("mongoose");
const Location = require("../models/location");

mongoose.connect("mongodb://localhost:27017/Namaste");

const locations = [
  { name: "HSR Layout" },
  { name: "Koramangala" },
  { name: "Indiranagar" },
  { name: "Whitefield" },
  { name: "Electronic City" },
  { name: "BTM Layout" },
  { name: "Marathahalli" },
  { name: "Bellandur" },
  { name: "Sarjapur Road" },
];

const seed = async () => {
  await Location.deleteMany();
  await Location.insertMany(locations);
  console.log("Locations Seeded");
  process.exit();
};

seed();