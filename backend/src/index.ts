// Load .env before any module reads process.env at import time
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes';
import moduleRoutes from './routes/module.routes';
import learnerRoutes, { certificateRouter } from './routes/learner.routes';
import paymentRoutes, { webhookRouter } from './routes/payment.routes';
import { errorHandler } from './middleware/error.middleware';
import { publicRateLimiter } from './middleware/rate-limit.middleware';
import { disconnectPrisma } from './infrastructure/prisma/client';
import { ProviderFactory } from './config/providers.config';
import { assertSigningKey } from './core/utils/certificate-signing';

const app = express();
const PORT = process.env.PORT || 4000;

// Trust proxy (required when behind reverse proxy like Traefik/Nginx)
// Set to 1 to trust only the first proxy (Traefik in Coolify)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Compression
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Payment webhooks read the raw body and come from a few provider IPs, so they
// sit before body parsing and the rate limiter
app.use('/api/payments/webhooks', webhookRouter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (each is rate limited for its own traffic: sign-in and sign-up per
// client IP, signed-in learners per account, public content per client IP)
app.use('/api/auth', authRoutes);
app.use('/api/modules', publicRateLimiter, moduleRoutes);
// Public certificate verification must be mounted before learnerRoutes,
// whose authenticate middleware would otherwise reject it
app.use('/api/learner', certificateRouter);
app.use('/api/learner', learnerRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/health', (_req, res) => {
  const config = ProviderFactory.getConfig();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    providers: {
      auth: config.auth,
      data: config.data,
      payment: config.payment,
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

// Fail fast on a missing payment key rather than at a learner's first payment
if (process.env.NODE_ENV === 'production') {
  ProviderFactory.getPaymentProvider();
}
// Same for the certificate signing key
assertSigningKey();

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await disconnectPrisma();
  process.exit(0);
});
