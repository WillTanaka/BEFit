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

let pages = [];

// Rota para criar uma nova página
router.post('/pages', (req, res) => {
    const { title, content } = req.body;
    const newPage = { id: Date.now(), title, content };
    pages.push(newPage);
    res.redirect('/pages'); // Redireciona para a lista de páginas após a criação
});

// Rota para listar todas as páginas
router.get('/pages', (req, res) => {
    res.render("pages", { pages: pages });
});

// Rota para exibir a página de edição (apenas para usuários autenticados)
router.get('/pages/:id/edit', isAuthenticated, (req, res) => {
    const { id } = req.params;
    const page = pages.find(page => page.id === Number(id));
    if (page) {
        res.render('editPage', { page: page });
    } else {
        res.status(404).json({ message: 'Página não encontrada' });
    }
});

// Rota para editar uma página existente
router.post('/pages/:id/edit', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    let page = pages.find(page => page.id === Number(id));
    if (page) {
        page.title = title;
        page.content = content;
        res.redirect('/pages'); // Redireciona para a lista de páginas após a edição
    } else {
        res.status(404).json({ message: 'Página não encontrada' });
    }
});

// Rota para remover uma página existente
router.delete('/pages/:id', (req, res) => {
    const { id } = req.params;
    pages = pages.filter(page => page.id !== Number(id));
    res.status(204).end();
});

module.exports = router