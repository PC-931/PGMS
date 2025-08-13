import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'ADMIN' | 'TENANT';
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    return next();
  };
};