import jwt, { type Secret } from 'jsonwebtoken';
import sha256 from 'fast-sha256';
import { config } from '../config/conf.ts';

export const REFRESH_TTL_SECS = 24 * 60 * 60;
export const ACCESS_TTL = '20m';

export function hashToken(token: string): string {
  return sha256.hash(Buffer.from(token, 'utf-8')).toString();
};

export interface JwtPayload {
  userId: number;
  username: string;
}

export function generateAccessToken(payload: JwtPayload): string {
  const JWT_SECRET: Secret = config.ACCESS_KEY;
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'ES256',
    expiresIn: ACCESS_TTL,
  });
};

export function generateRefreshToken(payload: JwtPayload): string {
  const JWT_SECRET: Secret = config.REFRESH_KEY;
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'ES256',
    expiresIn: REFRESH_TTL_SECS,
  });
};

export function verifyAccessToken(token: string): JwtPayload {
  const JWT_SECRET: Secret = config.ACCESS_KEY_PUB;
  return jwt.verify(token, JWT_SECRET, {
    algorithms: ['ES256'],
  }) as JwtPayload;
};

export function verifyRefreshToken(token: string): JwtPayload {
  const JWT_SECRET: Secret = config.REFRESH_KEY_PUB;
  return jwt.verify(token, JWT_SECRET, {
    algorithms: ['ES256'],
  }) as JwtPayload;
};