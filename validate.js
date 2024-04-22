const Joi = require('joi');

// Definir os esquemas de validação
const loginSchema = Joi.object({
  user_name: Joi.string().required(),
  password: Joi.string().required()
});

const pageSchema = Joi.object({
  url: Joi.string().required(),
  content: Joi.string().required()
});

const editPageSchema = Joi.object({
  content: Joi.string().required()
});

// Funções para validar os parâmetros
function validarLogin(req, res, next) {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
  } else {
    next();
  }
}

function validarPage(req, res, next) {
  const { error } = pageSchema.validate(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
  } else {
    next();
  }
}

function validarEditPage(req, res, next) {
  const { error } = editPageSchema.validate(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
  } else {
    next();
  }
}

// Usar as funções como middleware em suas rotas
router.post('/login', validarLogin, (req, res) => {
  // Seu código aqui
});

router.post('/pages', validarPage, (req, res) => {
  // Seu código aqui
});

router.post('/:url/edit', isAuthenticated, validarEditPage, (req, res) => {
  // Seu código aqui
});