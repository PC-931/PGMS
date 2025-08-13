import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }

  if (error && error.code === 'P2002') {
    return res.status(409).json({
      error: 'Resource already exists'
    });
  }

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};