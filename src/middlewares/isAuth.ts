import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { publicKey } from '../utils/jwt.ts';

interface JWTRequest extends Request {
  user?: {
    userId: number;
    username: string;
    iat?: number;
    exp?: number;
  } | undefined;
}

export const check = (
  req: JWTRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ error: 'No authorization header provided' });
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    return res
      .status(400)
      .json({ error: 'Invalid authorization format' });
  }

  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['ES256'],
    }) as JWTRequest['user'];

    req.user = decoded;

    return next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};