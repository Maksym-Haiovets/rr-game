import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('❌ Error occurred:', err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
    return;
  }

  // SQLite errors
  if (err.code && err.code.startsWith('SQLITE_')) {
    res.status(500).json({
      success: false,
      error: 'Database error occurred',
      details: err.message
    });
    return;
  }

  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
}
