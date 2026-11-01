import path from 'node:path';
import dotenv from 'dotenv';

// The repository root holds the shared .env; a backend-local one wins if both exist.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

import { createApp } from './app';
import { productionDeps } from './compose';
import { loadEnv } from './shared/config/env';
import { logger } from './shared/logger';

const env = loadEnv();
const app = createApp(productionDeps(env));

if (!env.midtrans.serverKey) logger.warn('MIDTRANS_SERVER_KEY belum diisi: pembayaran dinonaktifkan.');
if (!env.smtp.host && env.isProduction) logger.warn('SMTP belum dikonfigurasi: email OTP tidak akan terkirim.');

const server = app.listen(env.port, () => {
  logger.info('Event Yuk API ready', { url: `http://localhost:${env.port}`, docs: env.isProduction ? undefined : `http://localhost:${env.port}/api-docs`, env: env.nodeEnv });
});

const shutdown = (signal: string) => {
  logger.info('shutting down', { signal });
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
