"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validateRequest = (schema, property = 'body') => {
    return (req, res, next) => {
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
exports.validateRequest = validateRequest;
//# sourceMappingURL=validation.js.map