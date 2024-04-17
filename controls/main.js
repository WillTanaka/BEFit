const express = require('express')
const router = express.Router()

router.get("/", (req, res) => {
    res.render("index")
})

router.get("/login", (req, res) => {
    res.render("login")
});

router.get("/pages", (req, res) => {
    res.render("pages")
});

router.get("/home", (req, res) => {
    res.render("home")
});

router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

module.exports = router