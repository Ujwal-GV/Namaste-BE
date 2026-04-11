const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const adminRoutes = require("./routes/adminRoutes");
const utilityRoutes = require("./routes/utilityRoutes");
const requestRoutes = require("./routes/requestRoutes");
// const passport = require("passport");


// require("./config/passport");
connectDB();

const app = express();
const port = process.env.PORT || 8084;

app.use(cors({
    origin: ["http://localhost:5173", "https://namaste-be.onrender.com/"],
    credentials: true,
}));
app.use(express.json());

// app.use(passport.initialize());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
console.log("Entered");
app.get("/", (req, res) => {
    res.send("API working");
});
app.use("/user", userRoutes);
app.use("/property", propertyRoutes);
app.use("/admin", adminRoutes);
app.use("/utilities", utilityRoutes);
app.use("/requests", requestRoutes);

app.listen(port, () => console.log("Server running at port:\t" + port));