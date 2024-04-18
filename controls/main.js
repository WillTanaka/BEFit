const express = require('express')
const router = express.Router()

router.get("/", (req, res) => {
    res.render("index")
})

router.get("/home", (req, res) => {
    res.render("home")
});

// Rota para exibir a página de login
router.get('/login', (req, res) => {
    res.render('login');
});

// Rota para processar o formulário de login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.USERNAME && password === process.env.PASSWORD) {
        req.session.user = username;
        res.redirect('/home');
    } else {
        res.redirect('/login');
    }
});

// Rota para fazer logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

router.get("/pages", (req, res) => {
    res.render("pages")
});

module.exports = router