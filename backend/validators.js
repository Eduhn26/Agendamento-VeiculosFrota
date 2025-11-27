const Joi = require("joi");

const rentalSchema = Joi.object({
  vehicleId: Joi.string().required(),
  startDate: Joi.string().required(),
  endDate: Joi.string().required(),
  purpose: Joi.string().required()
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

module.exports = {
  validate,
  rentalSchema
};
