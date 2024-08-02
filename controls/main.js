const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

let pages = []; // Inicializando uma lista vazia para guardar informações sobre as páginas

// Função para carregar todas as páginas do diretório
function loadPages() {
    const pagesDir = path.join(__dirname, '../public/pages'); // Caminho para o diretório onde as páginas são armazenadas
    fs.readdir(pagesDir, (err, files) => { // Lendo o conteúdo do diretório para obter a lista de arquivos
        if (err) {
            console.error("Erro ao ler o diretório de páginas:", err);
            return;
        }
        pages = []; // Limpando a lista de páginas antes de carregar novas páginas

        files.forEach((file) => { // Percorre arquivo por arquivo no diretório            
            const filePath = path.join(pagesDir, file); // Cria o caminho completo para o arquivo            
            fs.readFile(filePath, 'utf8', (err, fileContent) => { // Lendo o conteúdo do arquivo
                if (err) {
                    console.error(`Erro ao ler o arquivo ${file}:`, err);
                } else {
                    try {
                        // Parseando o conteúdo JSON do arquivo para obter conteúdo e categoria
                        const { content, category } = JSON.parse(fileContent);
                        const url = path.basename(file, '.txt'); // Criando um objeto para a página com um identificador único e o conteúdo
                        pages.push({ id: Date.now(), url, content, category: category || 'default' });
                    } catch (e) {
                        console.error(`Erro ao parsear o conteúdo do arquivo ${file}:`, e);
                    }                  
                }
            });
        });
    });
}
loadPages(); // Carregando as páginas quando o servidor inicia

// Rota para a página inicial
router.get("/", (req, res) => {
    res.render("index");
});

// Rota para a página de login
router.get('/login', (req, res) => {
    res.render('login');
});

// Processa o formulário de login
router.post('/login', (req, res) => {
    const { user_name, password } = req.body; // Obtendo o nome de usuário e a senha do corpo da solicitação     
    if (user_name === process.env.USER_NAME && password === process.env.PASSWORD) { // Verificando se o nome de usuário e a senha estão corretos
        req.session.user = user_name; // Salvando o usuário na sessão
        res.redirect('/home');
    } else {
        res.render('login', { error: 'Usuário ou senha incorretos' });
    }
});

// Middleware para verificar se o usuário está autenticado
function isAuthenticated(req, res, next) {
    if (req.session.user) { // Se o usuário estiver autenticado, passa para a próxima função
        next();
    } else {
        res.redirect('/login');
    }
}

// Rota para a página inicial dos usuários autenticados
router.get('/home', isAuthenticated, (req, res) => {
    res.render('home');
});

// Rota para a página de criação de nova página
router.get('/newPage', isAuthenticated, (req, res) => {
    res.render('newPage');
});

// Rota para fazer logout
router.get('/logout', (req, res) => {
    req.session.destroy(); // Destroi a sessão do usuário
    res.redirect('/login');
});

// Rota para criar uma nova página
router.post('/pages', (req, res) => {
    const { url, content, category } = req.body; // Obtendo a URL, o conteúdo e a categoria da nova página do corpo da solicitação
    const newPage = { id: Date.now(), url, content, category: category || 'default' }; // Cria um objeto para a nova página

    // Cria um novo arquivo com o conteúdo e a categoria da página 
    const fileContent = JSON.stringify({ content, category });

    fs.writeFile(path.join(__dirname, '../public/pages', `${url}.txt`), fileContent, (err) => {
        if (err) {
            console.error("Erro ao criar arquivo de página:", err);
        } else {
            loadPages(); // Atualiza a lista de páginas após a criação do arquivo
            res.redirect('/pages');
        }
    });
});

// Rota para listar todas as páginas
router.get('/pages', (req, res) => {
    res.render("pages", { pages: pages });
});

// Rota para exibir o conteúdo da página
router.get('/:url', (req, res) => {
    const { url } = req.params; // Obtendo a URL da página dos parâmetros da solicitação
    const page = pages.find(page => page.url === url); // Encontra a página na lista de páginas
    if (page) {
        res.send(page.content); // Envia o conteúdo da página como resposta
    } else {
        res.status(404).json({ message: 'Página não encontrada' });
    }
});

// Rota para exibir a página de edição para usuários autenticados
router.get('/:url/edit', isAuthenticated, (req, res) => {
    const { url } = req.params; // Obtendo a URL da página dos parâmetros da solicitação
    const page = pages.find(page => page.url === url); // Encontra a página na lista de páginas
    if (page) {
        res.render('editPage', { page: page });
    } else {
        res.status(404).json({ message: 'Página não encontrada' });
    }
});

// Rota para editar uma página existente
router.post('/:url/edit', isAuthenticated, (req, res) => {
    const { url } = req.params; // Obtendo a URL da página dos parâmetros da solicitação
    const { content, category } = req.body; // Obtendo o novo conteúdo e categoria da página do corpo da solicitação
    let page = pages.find(page => page.url === url); // Encontra a página na lista de páginas
    if (page) {
        page.content = content; // Atualizando o conteúdo da página
        page.category = category; // Atualizando a categoria da página
        const fileContent = JSON.stringify({ content, category }); // Cria um objeto JSON com o conteúdo e categoria atualizados
        fs.writeFile(path.join(__dirname, '../public/pages', `${url}.txt`), fileContent, (err) => { // Atualizando o arquivo com o novo conteúdo e categoria
            if (err) {
                console.error("Erro ao atualizar o arquivo de página:", err);
            } else {
                loadPages(); // Atualizando a lista de páginas após a edição do arquivo
                res.redirect('/pages');
            }
        });
    } else {
        res.status(404).json({ message: 'Página não encontrada' });
    }
});

// Rota para remover uma página existente
router.post('/:url/delete', isAuthenticated, (req, res) => {
    const { url } = req.params; // Obtendo a URL da página dos parâmetros da solicitação
    pages = pages.filter(page => page.url !== url); // Removendo a página da lista de páginas
    fs.unlink(path.join(__dirname, '../public/pages', `${url}.txt`), (err) => { // Remove o arquivo .txt da página no caminho
        if (err) {
            console.error("Erro ao remover o arquivo de página:", err);
        } else {
            res.redirect('/pages');
        }
    });
});

module.exports = router;