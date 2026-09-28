import jwt from 'jsonwebtoken';
import { UserRole, AccountStatus } from '../../src/types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'reducte_secret_key_change_in_production';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  statut: AccountStatus;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
