import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import moduleRoutes from './routes/module.routes';
import learnerRoutes, { certificateRouter } from './routes/learner.routes';
import paymentRoutes from './routes/payment.routes';
import { errorHandler } from './middleware/error.middleware';
import { rateLimiter } from './middleware/rate-limit.middleware';
import { prismaClient, disconnectPrisma } from './infrastructure/prisma/client';
import { ProviderFactory } from './config/providers.config';

dotenv.config();

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

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
app.use('/api', rateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
// Public certificate verification must be mounted before learnerRoutes,
// whose authenticate middleware would otherwise reject it
app.use('/api/learner', certificateRouter);
app.use('/api/learner', learnerRoutes);
app.use('/api/payment', paymentRoutes); // M-Pesa payment routes

// Health check
app.get('/health', (req, res) => {
  const config = ProviderFactory.getConfig();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    providers: {
      auth: config.auth,
      data: config.data,
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

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
