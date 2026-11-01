import express, { type Express, type RequestHandler } from 'express';
import type { Env } from './shared/config/env';
import { ResponseCache } from './shared/cache/memoryCache';
import { TokenService } from './shared/crypto/jwt';
import { EventBus } from './shared/events/bus';
import { createAuthGuards } from './shared/http/auth';
import { errorHandler, notFoundHandler } from './shared/http/errorHandler';
import { requestLog } from './shared/http/requestLog';
import { authLimiter, corsPolicy, docsSecurityHeaders, generalLimiter, perEmailLimiter, securityHeaders } from './shared/http/security';
import type { Mailer } from './shared/mail/mailer';
import { createCatalogModule, type CatalogRepository } from './modules/catalog';
import { createEventsModule, type EventRepository } from './modules/events';
import { createIdentityModule, type DocumentStore, type GoogleIdentityVerifier, type KycRepository, type OtpRepository, type UserRepository } from './modules/identity';
import { createPaymentsModule, type PaymentGateway, type PaymentsRepository } from './modules/payments';
import { createNotificationsModule } from './modules/notifications';
import { createProposalsModule, type ProposalRepository } from './modules/proposals';
import { mountApiDocs } from './docs/openapi';

/** Everything that touches the outside world. Production wires Supabase and Midtrans; tests wire memory. */
export interface AppDeps {
  env: Env;
  users: UserRepository;
  otps: OtpRepository;
  kyc: KycRepository;
  documents: DocumentStore;
  events: EventRepository;
  catalog: CatalogRepository;
  proposals: ProposalRepository;
  payments: PaymentsRepository;
  google: GoogleIdentityVerifier;
  mailer: Mailer;
  gateway: PaymentGateway;
  /** Turn rate limiting off, for tests only. */
  disableRateLimits?: boolean;
}

function parseTrustProxy(value: string | undefined): boolean | number | string {
  if (!value || value === 'false') return false;
  if (value === 'true') return true;
  return /^\d+$/.test(value) ? Number(value) : value;
}

/**
 * Builds the whole application from its dependencies. The modules are wired here and nowhere else:
 *
 *   identity ◀── events ◀── proposals ◀── payments
 *       ▲           ▲            ▲
 *       └─────── catalog ────────┘
 *
 * An arrow means "may call the public API of". Modules never reach into each other's files.
 */
export function createApp(deps: AppDeps): Express {
  const { env } = deps;
  const bus = new EventBus();
  const tokens = new TokenService(env.jwtSecret, env.jwtTtl);
  const cache = new ResponseCache();
  const limited = !deps.disableRateLimits;
  const when = (...handlers: RequestHandler[]) => (limited ? handlers : []);

  const identity = createIdentityModule({ users: deps.users, otps: deps.otps, kyc: deps.kyc, documents: deps.documents, google: deps.google, mailer: deps.mailer, tokens, bus, env });
  const guards = createAuthGuards(identity.api, env.adminEmails);

  const events = createEventsModule({ repo: deps.events, identity: identity.api, cache });
  const proposals = createProposalsModule({ repo: deps.proposals, identity: identity.api, events: events.api, bus });
  const catalog = createCatalogModule({ repo: deps.catalog, identity: identity.api, events: events.api, proposals: proposals.api, cache });
  const payments = createPaymentsModule({ repo: deps.payments, gateway: deps.gateway, proposals: proposals.api, events: events.api, identity: identity.api, bus, env });

  createNotificationsModule({ bus, identity: identity.api, mailer: deps.mailer, env });

  const app = express();
  app.disable('x-powered-by');
  app.locals.jobs = identity.jobs;
  app.set('trust proxy', parseTrustProxy(env.trustProxy));

  app.use(requestLog);
  app.use('/api-docs', docsSecurityHeaders());
  app.use(securityHeaders());
  app.use(corsPolicy(env));
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  mountApiDocs(app, env);

  const api = express.Router();
  if (limited) api.use(generalLimiter());
  api.use(
    identity.router(guards, {
      auth: when(authLimiter()),
      otp: when(perEmailLimiter(3, 10, 'Terlalu sering meminta kode. Tunggu beberapa menit.')),
      login: when(perEmailLimiter(10, 15, 'Terlalu banyak percobaan masuk untuk email ini. Tunggu 15 menit.')),
    })
  );
  api.use('/events', events.router(guards));
  api.use('/proposals', proposals.router(guards, when(perEmailLimiter(1000, 15, ''))));
  api.use(catalog.router(guards));
  api.use('/payments', payments.router(guards, []));
  app.use('/api/v1', api);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
