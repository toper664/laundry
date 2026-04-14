import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

export const privateKey = fs.readFileSync(
  path.join(process.cwd(), 'keys/priv.key'),
  'utf8'
);

export const publicKey = fs.readFileSync(
  path.join(process.cwd(), 'keys/pub.key'),
  'utf8'
);

export interface JwtPayload {
  userId: number;
  username: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, privateKey, {
    algorithm: 'ES256',
    expiresIn: '20m',
  });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, privateKey, {
    algorithm: 'ES256',
    expiresIn: '24h',
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, publicKey, {
    algorithms: ['ES256'],
  }) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, publicKey, {
    algorithms: ['ES256'],
  }) as JwtPayload;
};