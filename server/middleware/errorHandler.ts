import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('API Error:', err);
  const status = err.status || 500;
  const message = err.message || 'Une erreur serveur est survenue.';
  res.status(status).json({ error: message });
}
