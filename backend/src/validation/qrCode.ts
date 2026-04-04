import Joi from 'joi';

export const qrCodeOptionsSchema = Joi.object({
  format: Joi.string().valid('png', 'svg').optional(),
  size: Joi.number().integer().min(100).max(1000).optional(),
  margin: Joi.number().integer().min(0).max(10).optional(),
  darkColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
  lightColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const pageIdSchema = Joi.object({
  pageId: Joi.string().uuid().required(),
});

export const slugSchema = Joi.object({
  slug: Joi.string().min(1).max(255).required(),
});