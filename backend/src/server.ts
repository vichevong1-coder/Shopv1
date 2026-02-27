import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import errorHandler from './middleware/error';
import createRateLimiter from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Content Security Policy
app.use((req: Request, res: Response, next) => {
  const isDev = process.env.NODE_ENV === 'development';
  const cspPolicy = isDev
    ? "default-src 'self'; connect-src 'self' http://localhost:*; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; frame-src 'self';"
    : "default-src 'self'; connect-src 'self' https://api.bakong.com https://res.cloudinary.com; script-src 'self'; style-src 'self' https:; img-src 'self' data: https:; font-src 'self';";
  res.setHeader('Content-Security-Policy', cspPolicy);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(createRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 100 }));

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler (must be last)
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
