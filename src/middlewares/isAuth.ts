import { type Request, type Response, type NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.ts';
import { deviceSchema, userSchema } from './check.schema.ts';

export const check = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, tokenFromHeader] = authHeader.split(' ');
  const tokenFromCookie = req.cookies?.accessToken;
  const token: string = scheme === 'Bearer' && tokenFromHeader ? tokenFromHeader : tokenFromCookie;

  if (scheme !== 'Bearer' || !token) {
    return res
      .status(401)
      .json({ error: 'No token provided' });
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err: any) {
    const msg = err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid token';
    return res.status(401).json({ message: msg });
  }

  let payload;
  if (decoded.type == 'user') {
    payload = userSchema.safeParse(decoded);
    if (!payload.success) {
      return res.status(400).json({
        error: 'Invalid token payload',
        details: payload.error.flatten(),
      });
    }
  } else if (decoded.type == 'device') {  
    payload = deviceSchema.safeParse(decoded);
    if (!payload.success) {
      return res.status(400).json({
        error: 'Invalid token payload',
        details: payload.error.flatten(),
      });
    }
  } else {
    return res.status(400).json({ error: 'Invalid token type' });
  }

  res.locals.auth = payload.success;
  res.locals.id = payload.data;

  return next();
};