import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (
  schema: Joi.ObjectSchema,
  property: 'body' | 'params' | 'query' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req[property]);
    
    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      res.status(400).json({
        error: 'Validation error',
        details: errorMessage
      });
      return;
    }
    
    next();
  };
};
