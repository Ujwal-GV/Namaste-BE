const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        console.log("ROLE:\t", req.user.role);
        
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }

        next();
    }
}

module.exports = authorizeRoles;