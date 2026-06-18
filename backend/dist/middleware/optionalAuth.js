"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = void 0;
const jwt_1 = require("../utils/jwt");
const authToken_1 = require("../utils/authToken");
const optionalAuth = async (req, res, next) => {
    try {
        for (const token of (0, authToken_1.getCandidateTokens)(req)) {
            try {
                const decoded = (0, jwt_1.verifyToken)(token);
                req.user = {
                    id: decoded.userId,
                    email: decoded.email,
                    name: '',
                    subscriptionType: decoded.subscriptionType,
                    subscriptionExpiresAt: null,
                    emailVerified: false,
                    oauthProvider: null,
                    oauthId: null,
                };
                break;
            }
            catch (error) {
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=optionalAuth.js.map