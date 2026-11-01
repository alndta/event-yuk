import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

// Swagger Documentation
import { swaggerUi, swaggerSpec } from './config/swagger';

// Security Middlewares
import {
  generalRateLimiter,
  authRateLimiter,
  proposalRateLimiter,
  xssSanitizerMiddleware,
  parameterPollutionGuard,
  safeErrorHandler,
} from './middleware/security';
import { noCacheMiddleware } from './middleware/cache';

// Module Routers
import eventsRouter from './modules/events/events.routes';
import proposalsRouter from './modules/proposals/proposals.routes';
import authRouter from './modules/auth/auth.routes';

const app = express();
const PORT = process.env.PORT || 5001;

/**
 * 1. Security Headers (Helmet)
 * Configured safely to allow Swagger UI inline assets and cross-origin calls
 */
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Swagger UI and local development
    crossOriginEmbedderPolicy: false,
  })
);

/**
 * 2. CORS Configuration
 */
app.use(
  cors({
    origin: true, // Allow all origins including localhost, mobile devices, and active tunnel URLs
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-role'],
  })
);

/**
 * 3. Body Parsing with Strict Payload Limit (Anti-DoS / Payload Bomb Protection)
 */
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

/**
 * 4. Input Sanitization & Anti-Injection Middleware
 * Recursively strips script tags, eval, javascript: protocols, and null bytes
 */
app.use(xssSanitizerMiddleware);

/**
 * 5. Parameter Pollution Guard (HPP)
 */
app.use(parameterPollutionGuard());

/**
 * 6. Rate Limiting (DDoS & Brute-Force Protection)
 */
app.use('/api/', generalRateLimiter);
app.use('/api/v1/auth', authRateLimiter);
app.use('/api/v1/proposals', proposalRateLimiter);

/**
 * 7. Interactive API Documentation (Swagger / OpenAPI 3.0)
 */
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Event Yuk API Documentation (OpenAPI 3.0)',
  })
);
app.use('/docs', (req: Request, res: Response) => res.redirect('/api-docs'));
app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * 8. API Module Routes
 */
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', authRouter);
app.use('/api/v1/events', eventsRouter);
app.use('/api/v1/proposals', noCacheMiddleware, proposalsRouter);

/**
 * 9. Health Check Endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'event-yuk-api',
    security: {
      helmet: 'active',
      rateLimiter: 'active',
      xssSanitizer: 'active',
      cors: 'active',
    },
    docs: 'http://localhost:5001/api-docs',
  });
});

/**
 * 10. Root API v1 Route
 */
app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({
    name: 'Event Yuk Ecosystem RESTful API',
    version: '1.0.0',
    documentation: 'http://localhost:5001/api-docs',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      events: '/api/v1/events',
      proposals: '/api/v1/proposals',
      sponsorship: '/api/v1/proposals/sponsorship/packages',
    },
  });
});

/**
 * 11. Safe Error Handling Middleware
 */
app.use(safeErrorHandler);

app.listen(PORT, () => {
  console.log(`[SERVER] Event Yuk API running at http://localhost:${PORT}`);
  console.log(`[SWAGGER] OpenAPI 3.0 Docs available at http://localhost:${PORT}/api-docs`);
});

export default app;
