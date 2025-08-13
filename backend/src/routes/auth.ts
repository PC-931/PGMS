import { Router } from 'express';
import { loginSchema } from '../lib/validation';
import { comparePassword } from '../lib/bcrypt';
import { generateToken } from '../lib/jwt';
import { authenticate, AuthRequest } from '../middleware/auth';
import { db } from '../services/mockDatabase';

export const authRouter = Router();

// Login
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password, rememberMe } = loginSchema.parse(req.body);

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Set cookie options based on rememberMe
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 7 days or 1 day
    };

    res.cookie('token', token, cookieOptions);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token
    });
  } catch (error) {
    return next(error);
  }
});

// Logout
authRouter.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Get current user
authRouter.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await db.findUserById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  } catch (error) {
    return next(error);
  }
});

// Verify token
authRouter.get('/verify', authenticate, (req: AuthRequest, res) => {
  res.json({ valid: true, user: req.user });
});