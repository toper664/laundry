import { type Request, type Response, type NextFunction } from 'express';
import { verifyAccessToken, type JwtPayload } from '../utils/jwt.ts';

export interface JwtRequest extends Request {
  user?: JwtPayload;
}

export const check = (
  req: JwtRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, tokenFromHeader] = authHeader.split(' ');
  const tokenFromCookie = req.cookies?.accessToken;
  const token = scheme === 'Bearer' && tokenFromHeader ? tokenFromHeader : tokenFromCookie;

  if (scheme !== 'Bearer' || !token) {
    return res
      .status(401)
      .json({ error: 'No token provided' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch (err: any) {
    const msg = err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid token';
    return res.status(403).json({ message: msg });
  }
};