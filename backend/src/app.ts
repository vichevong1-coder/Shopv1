import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/error';
import createRateLimiter from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import productRoutes from './routes/product';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/order';
import uploadRoutes from './routes/upload';
import adminRoutes from './routes/admin';
import paymentRoutes from './routes/payment';
import reviewRoutes from './routes/review';
import { stripeWebhook } from './controllers/payment';

const app = express();

const envOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.ALLOWED_ORIGINS,
]
  .filter(Boolean)
  .flatMap((val) => (val as string).split(',').map((s) => s.trim().replace(/\/+$/, '')))
  .filter(Boolean);

const defaultOrigins = [
  'https://vongshop.com',
  'https://www.vongshop.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultOrigins]));

const isOriginAllowed = (origin?: string): boolean => {
  if (!origin) return true;
  const normalized = origin.replace(/\/+$/, '');
  if (allowedOrigins.includes(normalized)) return true;
  if (
    normalized === 'https://vongshop.com' ||
    normalized === 'https://www.vongshop.com' ||
    normalized.endsWith('.vongshop.com')
  ) {
    return true;
  }
  return false;
};

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use((req: Request, res: Response, next) => {
  const isDev = process.env.NODE_ENV === 'development';
  const cspPolicy = isDev
    ? "default-src 'self'; connect-src 'self' http://localhost:* ws://localhost:*; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    : "default-src 'self'; connect-src 'self' https://vongshop.com https://*.vongshop.com https://api.bakong.com https://*.supabase.co https://api.stripe.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https: data:;";
  res.setHeader('Content-Security-Policy', cspPolicy);
  next();
});

// Stripe webhook must receive raw body — register BEFORE express.json()
app.post(
  '/api/payment/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

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

// Serve uploaded / seeded images locally
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/products/:id/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use(errorHandler);

export default app;
