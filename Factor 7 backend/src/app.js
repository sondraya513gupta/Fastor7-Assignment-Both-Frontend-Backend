import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

import authRoutes from './routes/auth.routes.js';
import enquiryRoutes from './routes/enquiry.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { generalRateLimit } from './middleware/rateLimit.middleware.js';

const app = express();

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── General Rate Limiting ──────────────────────────────────────────────────
app.use(generalRateLimit);

// ─── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Request Logging ────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Fastor CRM API is running.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── Swagger API Docs ───────────────────────────────────────────────────────
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Fastor CRM API Docs',
    customCss: '.swagger-ui .topbar { background-color: #1a1a2e; } .swagger-ui .topbar-wrapper img { display: none; } .swagger-ui .topbar-wrapper::before { content: "🚀 Fastor CRM API"; color: white; font-size: 1.4rem; font-weight: bold; padding: 0 1rem; }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      tryItOutEnabled: true,
    },
  })
);

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/enquiries', enquiryRoutes);

// ─── Error Handlers ─────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
