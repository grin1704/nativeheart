"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireAuth = exports.requireSubscription = exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
const authService_1 = require("../services/authService");
const subscription_1 = require("../utils/subscription");
const authService = new authService_1.AuthService();
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                error: 'Токен доступа отсутствует',
                code: 'MISSING_TOKEN'
            });
            return;
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await authService.getUserById(decoded.userId);
        req.user = user;
        req.featureAccess = (0, subscription_1.getFeatureAccess)(user.subscriptionType, user.subscriptionExpiresAt);
        next();
    }
    catch (error) {
        res.status(401).json({
            error: 'Недействительный токен доступа',
            code: 'INVALID_TOKEN'
        });
        return;
    }
};
exports.authenticateToken = authenticateToken;
const requireSubscription = (requiredFeature) => {
    return (req, res, next) => {
        if (!req.featureAccess) {
            res.status(401).json({
                error: 'Требуется аутентификация',
                code: 'AUTHENTICATION_REQUIRED'
            });
            return;
        }
        if (!req.featureAccess[requiredFeature]) {
            res.status(403).json({
                error: 'Данная функция недоступна в вашем тарифном плане',
                code: 'FEATURE_NOT_AVAILABLE',
                requiredFeature,
                currentSubscription: req.user?.subscriptionType
            });
            return;
        }
        next();
    };
};
exports.requireSubscription = requireSubscription;
exports.requireAuth = exports.authenticateToken;
const optionalAuth = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            const decoded = (0, jwt_1.verifyToken)(token);
            const user = await authService.getUserById(decoded.userId);
            req.user = user;
            req.featureAccess = (0, subscription_1.getFeatureAccess)(user.subscriptionType, user.subscriptionExpiresAt);
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map