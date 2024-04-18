const express = require('express')
const router = express.Router()

router.get("/", (req, res) => {
    res.render("index")
})

// Rota para exibir a página de login
router.get('/login', (req, res) => {
    res.render('login');
});

// Rota para processar o formulário de login
router.post('/login', (req, res) => {
    const { user_name, password } = req.body;
    if (user_name === process.env.USER_NAME && password === process.env.PASSWORD) {
        req.session.user = user_name;
        res.redirect('/home');
    } else {
        res.redirect('/login');
    }
});

// Middleware para verificar se o usuário está autenticado
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        // Usuário autenticado, continue para a próxima rota
        next();
    } else {
        // Usuário não autenticado, redirecione para a página de login
        res.redirect('/login');
    }
}

// Rota para exibir a página de home (apenas para usuários autenticados)
router.get('/home', isAuthenticated, (req, res) => {
    res.render('home');
});

// Rota para exibir a página de newPage (apenas para usuários autenticados)
router.get('/newPage', isAuthenticated, (req, res) => {
    res.render('newPage');
});

// Rota para fazer logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Rota para exibir a página de pages
router.get("/pages", (req, res) => {
    res.render("pages")
});

module.exports = router