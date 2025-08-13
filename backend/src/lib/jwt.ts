import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const JWT_SECRET = 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};