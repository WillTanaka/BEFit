const Joi = require('joi');

// Esquema Joi para a rota de login
const loginSchema = Joi.object({
    user_name: Joi.string().required(),
    password: Joi.string().required()
});

// Esquema Joi para a rota de criação de páginas
const pageSchema = Joi

