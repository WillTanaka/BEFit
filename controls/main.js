const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')

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
    const { url, content } = req.body;
    const newPage = { id: Date.now(), url, content };
    pages.push(newPage);

    // Cria um novo arquivo de texto com o conteúdo da página
    fs.writeFile(path.join(__dirname, '../public/pages', `${url}.txt`), content, err => {
        if (err) {
            console.error(err)
            return
        }
        // Arquivo criado com sucesso
    })

    res.redirect('/pages'); // Redireciona para a lista de páginas após a criação
});

// Rota para listar todas as páginas
router.get('/pages', (req, res) => {
    res.render("pages", { pages: pages });
});

router.get('/:url', (req, res) => {
    const { url } = req.params;
    const page = pages.find(page => page.url === url);
    if (page) {
        // Lê o conteúdo do arquivo de texto da página
        fs.readFile(path.join(__dirname, '../public/pages', `${url}.txt`), 'utf8', (err, data) => {
            if (err) {
                console.error(err)
                return
            }
            // Renderiza o conteúdo da página diretamente
            res.send(data);
        })
    } else {
        res.status(404).json({ message: 'Página não encontrada' });
    }
});

// Rota para exibir a página de edição (apenas para usuários autenticados)
router.get('/:url/edit', isAuthenticated, (req, res) => {
    const { url } = req.params;
    const page = pages.find(page => page.url === url);
    if (page) {
        res.render('editPage', { page: page });
    } else {
        res.status(404).json({ message: 'Página não encontrada' });
    }
});

// Rota para editar uma página existente
router.post('/:url/edit', isAuthenticated, (req, res) => {
    const { url } = req.params;
    const { content } = req.body;
    let page = pages.find(page => page.url === url);
    if (page) {
        page.content = content;

        // Atualiza o arquivo de texto com o novo conteúdo da página
        fs.writeFile(path.join(__dirname, '../public/pages', `${url}.txt`), content, err => {
            if (err) {
                console.error(err)
                return
            }
            // Arquivo atualizado com sucesso
        })

        res.redirect('/pages'); // Redireciona para a lista de páginas após a edição
    } else {
        res.status(404).json({ message: 'Página não encontrada' });
    }
});

// Rota para remover uma página existente
router.post('/:url/delete', isAuthenticated, (req, res) => {
    const { url } = req.params;
    pages = pages.filter(page => page.url !== url);

    // Remove o arquivo de texto da página
    fs.unlink(path.join(__dirname, '../public/pages', `${url}.txt`), err => {
        if (err) {
            console.error(err)
            return
        }
        // Arquivo removido com sucesso
    })

    res.redirect('/pages'); // Redireciona para a lista de páginas após a exclusão
});

module.exports = router