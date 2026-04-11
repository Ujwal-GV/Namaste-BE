const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const http = require("http");
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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

// app.use(passport.initialize());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.get("/", (req, res) => {
    res.send("API working");
});
app.use("/user", userRoutes);
app.use("/property", propertyRoutes);
app.use("/admin", adminRoutes);
app.use("/utilities", utilityRoutes);
app.use("/requests", requestRoutes);

server.listen(port, () => console.log("Server running at port:\t" + port));