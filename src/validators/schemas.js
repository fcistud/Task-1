const Joi = require('joi');

const customerSchema = Joi.object({
  name: Joi.string().required(),
  surname: Joi.string().required(),
  email: Joi.string().email().required()
});

const categorySchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required()
});

const shopItemSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().positive().required(),
  categoryIds: Joi.array().items(Joi.number().integer()).min(1).required()
});

const orderItemSchema = Joi.object({
  shopItemId: Joi.number().integer().required(),
  quantity: Joi.number().integer().positive().required()
});

const orderSchema = Joi.object({
  customerId: Joi.number().integer().required(),
  items: Joi.array().items(orderItemSchema).min(1).required()
});

module.exports = {
  customerSchema,
  categorySchema,
  shopItemSchema,
  orderSchema
};