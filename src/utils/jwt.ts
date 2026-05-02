import jwt, { type Secret } from 'jsonwebtoken';
import sha256 from 'fast-sha256';
import { type Identity } from '../middlewares/check.schema.ts';
import { config } from '../config/conf.ts';

export const REFRESH_TTL_SECS = 24 * 60 * 60;
export const ACCESS_TTL_SECS = 5 * 60;

export function hashToken(token: string): string {
  return sha256.hash(Buffer.from(token, 'utf-8')).toString();
};

export function generateAccessToken(payload: Identity): string {
  const JWT_SECRET: Secret = config.ACCESS_KEY;
  try {
    return jwt.sign(payload, JWT_SECRET, {
      algorithm: 'ES256',
      expiresIn: ACCESS_TTL_SECS,
    });
  } catch (err: unknown) {
    throw new Error(err instanceof Error ? err.message : 'Failed to generate access token');
  }
};

export function generateRefreshToken(payload: Identity): string {
  const JWT_SECRET: Secret = config.REFRESH_KEY;
  try {
    return jwt.sign(payload, JWT_SECRET, {
      algorithm: 'ES256',
      expiresIn: REFRESH_TTL_SECS,
    });
  } catch (err: unknown) {
    throw new Error(err instanceof Error ? err.message : 'Failed to generate refresh token');
  }
};

export function verifyAccessToken(token: string): Identity {
  const JWT_SECRET: Secret = config.ACCESS_KEY_PUB;
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['ES256'],
    }) as Identity;
  } catch (err: unknown) {
    throw new Error(err instanceof Error ? err.message : 'Invalid access token');
  }
};

export function verifyRefreshToken(token: string): Identity {
  const JWT_SECRET: Secret = config.REFRESH_KEY_PUB;
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['ES256'],
    }) as Identity;
  } catch (err: unknown) {
    throw new Error(err instanceof Error ? err.message : 'Invalid refresh token');
  }
};