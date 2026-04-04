"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPasswordAccessStatus = exports.clearPasswordAccess = exports.verifyAndGrantPasswordAccess = exports.checkPasswordAccess = void 0;
const password_1 = require("../utils/password");
const errors_1 = require("../utils/errors");
const database_1 = __importDefault(require("../config/database"));
const passwordSessions = new Map();
const SESSION_TIMEOUT = 30 * 60 * 1000;
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, pageIds] of passwordSessions.entries()) {
        const sessionData = JSON.parse(sessionId);
        if (now - sessionData.timestamp > SESSION_TIMEOUT) {
            passwordSessions.delete(sessionId);
        }
    }
}, 5 * 60 * 1000);
function generateSessionId(req) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    const timestamp = Date.now();
    return JSON.stringify({
        ip,
        userAgent: userAgent.substring(0, 100),
        timestamp
    });
}
function hasPasswordAccess(sessionId, pageId) {
    const pageIds = passwordSessions.get(sessionId);
    return pageIds ? pageIds.has(pageId) : false;
}
function grantPasswordAccess(sessionId, pageId) {
    let pageIds = passwordSessions.get(sessionId);
    if (!pageIds) {
        pageIds = new Set();
        passwordSessions.set(sessionId, pageIds);
    }
    pageIds.add(pageId);
}
const checkPasswordAccess = async (req, res, next) => {
    try {
        const pageId = req.params.id || req.params.slug || req.params.memorialPageId || req.params.pageId;
        if (!pageId) {
            return next();
        }
        let page;
        if (pageId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            page = await database_1.default.memorialPage.findUnique({
                where: { id: pageId },
                select: {
                    id: true,
                    isPrivate: true,
                    passwordHash: true,
                    ownerId: true
                }
            });
        }
        else {
            page = await database_1.default.memorialPage.findUnique({
                where: { slug: pageId },
                select: {
                    id: true,
                    isPrivate: true,
                    passwordHash: true,
                    ownerId: true
                }
            });
        }
        if (!page) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        if (!page.isPrivate || !page.passwordHash) {
            return next();
        }
        const userId = req.user?.id;
        if (userId) {
            if (page.ownerId === userId) {
                return next();
            }
            const collaborator = await database_1.default.collaborator.findFirst({
                where: {
                    memorialPageId: page.id,
                    userId,
                    acceptedAt: { not: null }
                }
            });
            if (collaborator) {
                return next();
            }
        }
        const sessionId = generateSessionId(req);
        if (hasPasswordAccess(sessionId, page.id)) {
            return next();
        }
        const providedPassword = req.query.password;
        if (providedPassword) {
            const isValidPassword = await (0, password_1.comparePassword)(providedPassword, page.passwordHash);
            if (isValidPassword) {
                grantPasswordAccess(sessionId, page.id);
                return next();
            }
        }
        throw new errors_1.UnauthorizedError('Для доступа к этой странице требуется пароль');
    }
    catch (error) {
        next(error);
    }
};
exports.checkPasswordAccess = checkPasswordAccess;
const verifyAndGrantPasswordAccess = async (req, res, next) => {
    try {
        const pageId = req.params.id;
        const { password } = req.body;
        if (!password) {
            throw new errors_1.UnauthorizedError('Пароль обязателен');
        }
        const page = await database_1.default.memorialPage.findUnique({
            where: { id: pageId },
            select: {
                id: true,
                isPrivate: true,
                passwordHash: true
            }
        });
        if (!page) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        if (!page.isPrivate || !page.passwordHash) {
            return res.json({
                success: true,
                data: { isValid: true },
                message: 'Страница не защищена паролем'
            });
        }
        const isValidPassword = await (0, password_1.comparePassword)(password, page.passwordHash);
        if (isValidPassword) {
            const sessionId = generateSessionId(req);
            grantPasswordAccess(sessionId, page.id);
        }
        res.json({
            success: true,
            data: { isValid: isValidPassword },
            message: isValidPassword ? 'Пароль верный' : 'Неверный пароль'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyAndGrantPasswordAccess = verifyAndGrantPasswordAccess;
const clearPasswordAccess = (req, res) => {
    const pageId = req.params.id;
    const sessionId = generateSessionId(req);
    const pageIds = passwordSessions.get(sessionId);
    if (pageIds) {
        pageIds.delete(pageId);
        if (pageIds.size === 0) {
            passwordSessions.delete(sessionId);
        }
    }
    res.json({
        success: true,
        message: 'Доступ к странице отозван'
    });
};
exports.clearPasswordAccess = clearPasswordAccess;
const getPasswordAccessStatus = (req, res) => {
    const pageId = req.params.id;
    const sessionId = generateSessionId(req);
    const hasAccess = hasPasswordAccess(sessionId, pageId);
    res.json({
        success: true,
        data: { hasAccess }
    });
};
exports.getPasswordAccessStatus = getPasswordAccessStatus;
//# sourceMappingURL=passwordSession.js.map