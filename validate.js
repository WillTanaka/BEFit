const Joi = require('joi');
require('dotenv').config();

// Define o esquema de validação usando Joi
const schema = Joi.object({
  USER_NAME: Joi.string().required(),
  PASSWORD: Joi.string().required(),
});

// Valida os valores do arquivo .env
const { error, value } = schema.validate(process.env);

if (error) {
  console.error('Erro de validação:', error.message);
  process.exit(1);
}

console.log('Arquivo .env válido:', value);