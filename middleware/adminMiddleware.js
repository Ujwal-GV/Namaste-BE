const adminOnly = (req, res, next) => {
    if(req.user.role !== "admin") {
        return res.status(403).josn({
            message: "Admin access only"
        })
    }
    next();
};

module.exports = adminOnly;