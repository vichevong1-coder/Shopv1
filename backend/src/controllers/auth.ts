import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { sendPasswordResetEmail } from '../utils/email';

const JWT_ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET || 'access-secret';
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
const JWT_ACCESS_EXPIRY: string = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY: string = process.env.JWT_REFRESH_EXPIRY || '7d';

const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

// Helper: Generate JWT tokens
const generateAccessToken = (userId: string): string => {
  const options: SignOptions = { expiresIn: JWT_ACCESS_EXPIRY as any };
  return jwt.sign({ userId }, JWT_ACCESS_SECRET, options);
};

const generateRefreshToken = (userId: string): string => {
  const options: SignOptions = { expiresIn: JWT_REFRESH_EXPIRY as any };
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, options);
};

// POST /api/auth/register
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const rawRefreshToken = generateRefreshToken('temp');

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'customer',
        refreshTokens: [hashToken(rawRefreshToken)],
      },
    });

    const accessToken = generateAccessToken(user.id);
    const realRefreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokens: [hashToken(realRefreshToken)] },
    });

    res.cookie('refreshToken', realRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user.id);
    const rawRefreshToken = generateRefreshToken(user.id);
    const hashedRefreshToken = hashToken(rawRefreshToken);

    const updatedTokens = [...user.refreshTokens.slice(-4), hashedRefreshToken];
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokens: updatedTokens },
    });

    res.cookie('refreshToken', rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      const hashedToken = hashToken(refreshToken);
      const user = await prisma.user.findFirst({
        where: { refreshTokens: { has: hashedToken } },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            refreshTokens: user.refreshTokens.filter((t: string) => t !== hashedToken),
          },
        });
      }
    }

    res.clearCookie('refreshToken');
    res.json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/refresh-token
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
    } catch {
      return res.status(401).json({ message: 'Refresh token invalid or expired' });
    }
    const hashedToken = hashToken(refreshToken);

    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        refreshTokens: { has: hashedToken },
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Refresh token invalid or expired' });
    }

    const newAccessToken = generateAccessToken(user.id);

    res.json({ message: 'Token refreshed', accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return res.json({ message: 'If email exists, password reset link will be sent' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const resetToken = hashToken(rawToken);
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    try {
      await sendPasswordResetEmail(user.email, rawToken);
    } catch (emailError) {
      console.error('Email send error:', emailError);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV] Reset token for ${user.email}: ${rawToken}`);
        return res.json({ message: '[DEV] Email failed — check console for token', token: rawToken });
      }
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });
      return res.status(500).json({ message: 'Failed to send reset email' });
    }

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/reset-password/:token
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'New password is required' });
    }

    const hashedToken = hashToken(token as string);
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};
