import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/error';
import createRateLimiter from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import productRoutes from './routes/product';
import uploadRoutes from './routes/upload';
import adminRoutes from './routes/admin';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use((req: Request, res: Response, next) => {
  const isDev = process.env.NODE_ENV === 'development';
  const cspPolicy = isDev
    ? "default-src 'self'; connect-src 'self' http://localhost:*; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; frame-src 'self';"
    : "default-src 'self'; connect-src 'self' https://api.bakong.com https://*.supabase.co; script-src 'self'; style-src 'self' https:; img-src 'self' data: https:; font-src 'self';";
  res.setHeader('Content-Security-Policy', cspPolicy);
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Skip rate limiter in test environment so tests don't trip the 100-req ceiling
if (process.env.NODE_ENV !== 'test') {
  app.use(createRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 100 }));
}

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use(errorHandler);

export default app;
