"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireAuth = exports.requireSubscription = exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
const authToken_1 = require("../utils/authToken");
const authService_1 = require("../services/authService");
const subscription_1 = require("../utils/subscription");
const authService = new authService_1.AuthService();
const verifyFirstValid = (req) => {
    for (const token of (0, authToken_1.getCandidateTokens)(req)) {
        try {
            return (0, jwt_1.verifyToken)(token);
        }
        catch {
        }
    }
    return null;
};
const authenticateToken = async (req, res, next) => {
    try {
        const decoded = verifyFirstValid(req);
        if (!decoded) {
            res.status(401).json({
                error: 'Недействительный токен доступа',
                code: 'INVALID_TOKEN'
            });
            return;
        }
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
        const decoded = verifyFirstValid(req);
        if (decoded) {
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