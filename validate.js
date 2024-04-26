const Joi = require('joi');

const loginSchema = Joi.object({
    user_name: Joi.string().required(),
    password: Joi.string().required()
});

const pageSchema = Joi.object({
    url: Joi.string().required(),
    content: Joi.string().required()
});