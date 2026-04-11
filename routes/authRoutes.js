const passport = require("passport");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.get("/google", passport.authenticate("google", {scope: ["profile", "email"]}));

router.get("/google/callback", passport.authenticate("google", {session: false}),
    (req, res) => {
        const token = jwt.sign({id: req.user.id},
            process.env.JWT_SECRET
        );
        res.redirect(`http://localhost:5173/login?token=${token}`);
    }
);

module.exports = router;
