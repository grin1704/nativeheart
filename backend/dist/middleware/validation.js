"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validateRequest = (schema, property = 'body') => {
    return (req, res, next) => {
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
exports.validateRequest = validateRequest;
//# sourceMappingURL=validation.js.map