import { Request, Response, NextFunction } from 'express';
import { comparePassword } from '../utils/password';
import { NotFoundError, UnauthorizedError } from '../utils/errors';
import prisma from '../config/database';

// Simple in-memory session store for password access
// In production, this should be replaced with Redis or database-backed sessions
const passwordSessions = new Map<string, Set<string>>();

// Session timeout (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Clean up expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, pageIds] of passwordSessions.entries()) {
    const sessionData = JSON.parse(sessionId);
    if (now - sessionData.timestamp > SESSION_TIMEOUT) {
      passwordSessions.delete(sessionId);
    }
  }
}, 5 * 60 * 1000);

/**
 * Generates a session ID for password access
 */
function generateSessionId(req: Request): string {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  const timestamp = Date.now();
  
  return JSON.stringify({
    ip,
    userAgent: userAgent.substring(0, 100), // Limit length
    timestamp
  });
}

/**
 * Checks if user has already entered password for this page in current session
 */
function hasPasswordAccess(sessionId: string, pageId: string): boolean {
  const pageIds = passwordSessions.get(sessionId);
  return pageIds ? pageIds.has(pageId) : false;
}

/**
 * Grants password access for a page in current session
 */
function grantPasswordAccess(sessionId: string, pageId: string): void {
  let pageIds = passwordSessions.get(sessionId);
  if (!pageIds) {
    pageIds = new Set();
    passwordSessions.set(sessionId, pageIds);
  }
  pageIds.add(pageId);
}

/**
 * Middleware to check password access for private memorial pages
 */
export const checkPasswordAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageId = req.params.id || req.params.slug || req.params.memorialPageId || req.params.pageId;
    
    if (!pageId) {
      return next();
    }

    // Find the page by ID or slug
    let page;
    if (pageId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // It's a UUID (ID)
      page = await prisma.memorialPage.findUnique({
        where: { id: pageId },
        select: { 
          id: true, 
          isPrivate: true, 
          passwordHash: true, 
          ownerId: true 
        }
      });
    } else {
      // It's a slug
      page = await prisma.memorialPage.findUnique({
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
      throw new NotFoundError('Памятная страница не найдена');
    }

    // If page is not private, allow access
    if (!page.isPrivate || !page.passwordHash) {
      return next();
    }

    // Check if user is the owner or collaborator (they have full access)
    const userId = (req as any).user?.id;
    if (userId) {
      if (page.ownerId === userId) {
        return next();
      }

      // Check if user is a collaborator
      const collaborator = await prisma.collaborator.findFirst({
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

    // Check if password was already provided in this session
    const sessionId = generateSessionId(req);
    if (hasPasswordAccess(sessionId, page.id)) {
      return next();
    }

    // Check if password is provided in query params (for direct access)
    const providedPassword = req.query.password as string;
    if (providedPassword) {
      const isValidPassword = await comparePassword(providedPassword, page.passwordHash);
      if (isValidPassword) {
        // Grant access for this session
        grantPasswordAccess(sessionId, page.id);
        return next();
      }
    }

    // Password required
    throw new UnauthorizedError('Для доступа к этой странице требуется пароль');

  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to verify password and grant session access
 */
export const verifyAndGrantPasswordAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageId = req.params.id;
    const { password } = req.body;

    if (!password) {
      throw new UnauthorizedError('Пароль обязателен');
    }

    // Find the page
    const page = await prisma.memorialPage.findUnique({
      where: { id: pageId },
      select: { 
        id: true, 
        isPrivate: true, 
        passwordHash: true 
      }
    });

    if (!page) {
      throw new NotFoundError('Памятная страница не найдена');
    }

    if (!page.isPrivate || !page.passwordHash) {
      return res.json({
        success: true,
        data: { isValid: true },
        message: 'Страница не защищена паролем'
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, page.passwordHash);
    
    if (isValidPassword) {
      // Grant access for this session
      const sessionId = generateSessionId(req);
      grantPasswordAccess(sessionId, page.id);
    }

    res.json({
      success: true,
      data: { isValid: isValidPassword },
      message: isValidPassword ? 'Пароль верный' : 'Неверный пароль'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Clears password access for a page in current session
 */
export const clearPasswordAccess = (req: Request, res: Response) => {
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

/**
 * Gets current session password access status
 */
export const getPasswordAccessStatus = (req: Request, res: Response) => {
  const pageId = req.params.id;
  const sessionId = generateSessionId(req);
  
  const hasAccess = hasPasswordAccess(sessionId, pageId);

  res.json({
    success: true,
    data: { hasAccess }
  });
};