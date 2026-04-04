import Joi from 'joi';

export const createTributeSchema = Joi.object({
  authorName: Joi.string().min(1).max(255).required(),
  authorEmail: Joi.string().email().optional(),
  text: Joi.string().min(1).max(5000).required(),
  photoId: Joi.string().uuid().optional()
});

export const updateTributeSchema = Joi.object({
  authorName: Joi.string().min(1).max(255).optional(),
  authorEmail: Joi.string().email().optional(),
  text: Joi.string().min(1).max(5000).optional(),
  photoId: Joi.string().uuid().optional(),
  isApproved: Joi.boolean().optional()
});

export const getTributesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  approved: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('all')
  ).optional()
});

export const moderateTributeSchema = Joi.object({
  isApproved: Joi.boolean().required(),
  reason: Joi.string().max(500).optional()
});