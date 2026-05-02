import { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import { verifyRefreshToken,
         generateAccessToken,
         generateRefreshToken,
         hashToken,
         REFRESH_TTL_SECS, } from '../../utils/jwt.ts';
import { AppDataSource } from '../../config/database.ts';
import { UserRepository } from '../user/user.queries.ts';
import { type UserInfo } from '../../middlewares/check.schema.ts';
import { type LoginBody, loginSchema } from './auth.schema.ts';

const repo = new UserRepository(AppDataSource);
const SALT_ROUNDS = 12;

export const register = async (
  req: Request<{}, {}, LoginBody>,
  res: Response
): Promise<Response> => {
  try { 
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: result.error.flatten(),
      });
    }

    if (await repo.findByUsername(result.data.username)) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const { username, password } = result.data;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = repo.create({
      username,
      password: hashedPassword
    });

    const payload = {
      type: 'user',
      sub: user.id,
      username: user.username,
    } as UserInfo;

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = hashToken(refreshToken);
    await repo.save(user);

    return res.status(201).cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: REFRESH_TTL_SECS * 1000
    }).json({
      success: true,
      token: accessToken,
      user: {
        id: user.id,
        username: user.username,
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const login = async (
  req: Request<{}, {}, LoginBody>,
  res: Response
): Promise<Response> => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: result.error.flatten(),
      });
    }
    
    const { username, password } = result.data;

    const user = await repo.findByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = {
      type: 'user',
      sub: user.id,
      username: user.username,
    } as UserInfo;

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    repo.update(payload.sub, { isActiveUser: true, refreshToken: hashToken(refreshToken) });

    return res.status(200).cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: REFRESH_TTL_SECS * 1000
    }).json({
      success: true,
      token: accessToken,
      user: {
        id: user.id,
        username: user.username,
      }
  });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken) as UserInfo;
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const payload = {
      type: 'user',
      sub: decoded.sub,
      username: decoded.username,
    } as UserInfo;

    const user = await repo.findById(payload.sub);
    if (!user || user.refreshToken !== hashToken(refreshToken)) {
      return res.status(403).json({ error: 'Unrecognized refresh token' });
    }

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await repo.update(payload.sub, { refreshToken: hashToken(newRefreshToken) });

    return res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: REFRESH_TTL_SECS * 1000
    }).json({
      success: true,
      token: newAccessToken,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const user = await repo.findByRefreshToken(hashToken(refreshToken));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await repo.update(user.id, { isActiveUser: false, refreshToken: null });

      if (user.refreshToken === null || !user.isActiveUser) {
        return res.status(403).json({ error: 'User already logged out' });
      }
    }
    else {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    return res.status(200).clearCookie('refreshToken').json({ message: 'Logged out' });
  } catch (err) {
    return res.status(400).json({ error: 'Bad request' });
  }
};