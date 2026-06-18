import { Request, Response } from 'express';

export const AUTH_COOKIE_NAME = 'token';

// Держим cookie живой 90 дней — серверные httpOnly-cookie не попадают под
// 7-дневное ограничение Safari ITP на script-writable storage (localStorage).
const COOKIE_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Возвращает упорядоченный список токенов-кандидатов из запроса: сначала из
 * заголовка Authorization: Bearer <token> (старое поведение фронта), затем из
 * httpOnly-cookie `token`. Middleware перебирает их и берёт первый валидный.
 *
 * Зачем список, а не один токен:
 *  - старые прямые fetch шлют `Bearer null`/`Bearer undefined`, если localStorage
 *    очищен (Safari ITP) — такой заголовок отбрасываем и используем cookie;
 *  - протухший токен в заголовке не должен мешать свежей cookie.
 *
 * Cookie парсим из заголовка вручную, чтобы не тянуть зависимость cookie-parser
 * (иначе пришлось бы пересобирать backend на ограниченном по ресурсам проде).
 */
export const getCandidateTokens = (req: Request): string[] => {
  const tokens: string[] = [];

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
      if (eqIndex === -1) continue;
      const name = part.slice(0, eqIndex).trim();
      if (name === AUTH_COOKIE_NAME) {
        const cookieToken = decodeURIComponent(part.slice(eqIndex + 1).trim());
        if (cookieToken) tokens.push(cookieToken);
        break;
      }
    }
  }

  return tokens;
};

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'lax' as const,
  path: '/',
});

/** Ставит долгоживущую httpOnly-cookie с JWT (вызывается при логине/регистрации/OAuth). */
export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(AUTH_COOKIE_NAME, token, {
    ...cookieOptions(),
    maxAge: COOKIE_MAX_AGE_MS,
  });
};

/** Удаляет auth-cookie (вызывается при выходе). */
export const clearAuthCookie = (res: Response): void => {
  res.clearCookie(AUTH_COOKIE_NAME, cookieOptions());
};
