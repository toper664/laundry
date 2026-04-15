import { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../../utils/jwt.ts';
import { AppDataSource } from '../../config/database.ts';
import { UserRepository } from '../user/user.queries.ts';
import { registerSchema, loginSchema } from './auth.schema.ts';

const repo = new UserRepository(AppDataSource);
const SALT_ROUNDS = 12;

type LoginBody = z.infer<typeof loginSchema>;

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

    const { username, password } = result.data;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = repo.create({
      username,
      password: hashedPassword
    });

    const payload = {
      userId: user.id,
      username: user.username,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = refreshToken;
    await repo.save(user);

    return res.status(201).cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    }).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
      },
      accessToken,
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
      userId: user.id,
      username: user.username,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    repo.update(payload.userId, { refreshToken: refreshToken });

    return res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    }).json({
      success: true,
      user: payload,
      accessToken,
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
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const payload = verifyRefreshToken(refreshToken);

    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      username: payload.username,
    });

    const newRefreshToken = generateRefreshToken({
      userId: payload.userId,
      username: payload.username,
    });

    await repo.update(payload.userId, { refreshToken: newRefreshToken });

    return res.cookie('jwt', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    }).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const user = await repo.findByRefreshToken(refreshToken);
      if (user) {
        await repo.update(user.id, { refreshToken: null });
      }
      else {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }
    }
    return res.status(200).clearCookie('jwt').json({ message: 'Logged out' });
  } catch (err) {
    return res.status(400).json({ error: 'Bad request' });
  }
};