import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
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

// Helper: Calculate token expiry date
const getTokenExpiry = (expiryStr: string): Date => {
  const now = new Date();
  const match = expiryStr.match(/^(\d+)([mhd])$/);
  if (!match) return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [, num, unit] = match;
  const n = parseInt(num, 10);
  if (unit === 'm') return new Date(now.getTime() + n * 60 * 1000);
  if (unit === 'h') return new Date(now.getTime() + n * 60 * 60 * 1000);
  if (unit === 'd') return new Date(now.getTime() + n * 24 * 60 * 60 * 1000);
  return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
};

// POST /api/auth/register
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const user = new User({ name, email: email.toLowerCase(), password, role: 'customer' });
    await user.save();

    const accessToken = generateAccessToken(user._id.toString());
    const rawRefreshToken = generateRefreshToken(user._id.toString());

    user.refreshTokens.push({
      token: hashToken(rawRefreshToken),
      device: req.headers['user-agent'] || 'unknown',
      expiresAt: getTokenExpiry(JWT_REFRESH_EXPIRY),
    });
    await user.save();

    res.cookie('refreshToken', rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
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

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user._id.toString());
    const rawRefreshToken = generateRefreshToken(user._id.toString());

    user.refreshTokens.push({
      token: hashToken(rawRefreshToken),
      device: req.headers['user-agent'] || 'unknown',
      expiresAt: getTokenExpiry(JWT_REFRESH_EXPIRY),
    });
    await user.save();

    res.cookie('refreshToken', rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
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
      await User.updateOne(
        { 'refreshTokens.token': hashedToken },
        { $pull: { refreshTokens: { token: hashedToken } } }
      );
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

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
    const hashedToken = hashToken(refreshToken);
    const user = await User.findOne({
      _id: decoded.userId,
      'refreshTokens.token': hashedToken,
    });

    if (!user) {
      return res.status(401).json({ message: 'Refresh token invalid or expired' });
    }

    const newAccessToken = generateAccessToken(user._id.toString());

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

    const user = await User.findById(userId).select('-password -refreshTokens');
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

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'If email exists, password reset link will be sent' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');

    user.passwordResetToken = hashToken(rawToken);
    user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, rawToken);
    } catch (emailError) {
      console.error('Email send error:', emailError);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV] Reset token for ${user.email}: ${rawToken}`);
        return res.json({ message: '[DEV] Email failed — check console for token', token: rawToken });
      }
      user.passwordResetToken = undefined;
      user.passwordResetExpiry = undefined;
      await user.save();
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

    const user = await User.findOne({
      passwordResetToken: hashToken(token as string),
      passwordResetExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};
