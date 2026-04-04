import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (
  schema: Joi.ObjectSchema,
  property: 'body' | 'params' | 'query' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    console.log(`🔍 Валидация ${property}:`, req[property]);
    
    const { error } = schema.validate(req[property]);
    
    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      console.log(`❌ Ошибка валидации ${property}:`, errorMessage);
      console.log('Детали ошибки:', error.details);
      
      res.status(400).json({
        error: 'Validation error',
        details: errorMessage
      });
      return;
    }
    
    console.log(`✅ Валидация ${property} пройдена`);
    next();
  };
};