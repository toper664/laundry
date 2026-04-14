import { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../../utils/jwt.ts';
import { AppDataSource } from '../../config/database.ts';
import { User } from '../../models/user.ts';
import { registerSchema, loginSchema } from './auth.schema.ts';

const userRepository = AppDataSource.getRepository(User);
const SALT_ROUNDS = 12;

type RegisterBody = z.infer<typeof registerSchema>;

type LoginBody = z.infer<typeof loginSchema>;

export const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response
): Promise<Response> => {
  try { 
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: result.error.flatten(),
      });
    }

    const { username, email, password } = result.data;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = userRepository.create({
      username,
      email,
      password: hashedPassword
    });

    const payload = {
      userId: user.id,
      username: user.username,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = refreshToken;
    await userRepository.save(user);

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
        email: user.email
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

    const user = await userRepository.findOneBy({ username });

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

    userRepository.update({ id: payload.userId }, { refreshToken: refreshToken });

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

    userRepository.update({ id: payload.userId }, { refreshToken: newRefreshToken });

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