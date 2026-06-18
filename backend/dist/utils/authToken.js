"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookie = exports.setAuthCookie = exports.getCandidateTokens = exports.AUTH_COOKIE_NAME = void 0;
exports.AUTH_COOKIE_NAME = 'token';
const COOKIE_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;
const getCandidateTokens = (req) => {
    const tokens = [];
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const headerToken = authHeader.substring(7).trim();
        if (headerToken && headerToken !== 'null' && headerToken !== 'undefined') {
            tokens.push(headerToken);
        }
    }
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
        for (const part of cookieHeader.split(';')) {
            const eqIndex = part.indexOf('=');
            if (eqIndex === -1)
                continue;
            const name = part.slice(0, eqIndex).trim();
            if (name === exports.AUTH_COOKIE_NAME) {
                const cookieToken = decodeURIComponent(part.slice(eqIndex + 1).trim());
                if (cookieToken)
                    tokens.push(cookieToken);
                break;
            }
        }
    }
    return tokens;
};
exports.getCandidateTokens = getCandidateTokens;
const cookieOptions = () => ({
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    path: '/',
});
const setAuthCookie = (res, token) => {
    res.cookie(exports.AUTH_COOKIE_NAME, token, {
        ...cookieOptions(),
        maxAge: COOKIE_MAX_AGE_MS,
    });
};
exports.setAuthCookie = setAuthCookie;
const clearAuthCookie = (res) => {
    res.clearCookie(exports.AUTH_COOKIE_NAME, cookieOptions());
};
exports.clearAuthCookie = clearAuthCookie;
//# sourceMappingURL=authToken.js.map