const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async(req, res, next) => {
    try {
        let token = req.headers.authorization;

        if(!token || !token.startsWith("Bearer")) {
            return res.status(401).json({ message: "No token access denied" });
        }

        token = token.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        const user = await User.findById(decoded.id );
        
        if(!user || user.accountStatus === "blocked") {
            return res.status(403).json({ message: "Account blocked or Invalid." });
        }
        next();
    } catch (error) {
        console.log("AuthMiddleware:\t", error);
        return res.status(500).json({ message: "Invalid token" });
    }
}

module.exports = protect;