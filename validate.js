const Joi = require('joi');

//Definição do esquema de validação para login
const loginSchema = Joi.object({
    user_name: Joi.string().required(),
    password: Joi.string().required()
});

//Definição do esquema de validação para página
const pageSchema = Joi.object({
    url: Joi.string().required(),
    content: Joi.string().required()
});

module.exports = {
    validateLogin: (req, res, next) => {
        //Valida o corpo da requisição de login
        const { error } = loginSchema.validate(req.body);
        if (error) {
            //Retorna uma mensagem de erro se a validação falhar
            return res.status(400).json({ message: error.details[0].message });
        }
        next();
    },
    validatePage: (req, res, next) => {
        //Valida o corpo da requisição de página
        const { error } = pageSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        next();
    }
};