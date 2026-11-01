import type { RequestHandler } from 'express';
import type { Env } from '../../shared/config/env';
import type { EventBus } from '../../shared/events/bus';
import type { AuthGuards } from '../../shared/http/auth';
import type { EventsApi } from '../events';
import type { IdentityApi } from '../identity';
import type { ProposalsApi } from '../proposals';
import type { PaymentGateway, PaymentsRepository } from './ports';
import { createPaymentsRouter } from './routes';
import { PaymentsService } from './service';

export type { PaymentGateway, PaymentsRepository } from './ports';
export { SupabasePaymentsRepository } from './infra/supabase.repository';
export { MidtransGateway } from './infra/midtrans.gateway';

export function createPaymentsModule(deps: {
  repo: PaymentsRepository;
  gateway: PaymentGateway;
  proposals: ProposalsApi;
  events: EventsApi;
  identity: IdentityApi;
  bus: EventBus;
  env: Env;
}) {
  const service = new PaymentsService(deps.repo, deps.gateway, deps.proposals, deps.events, deps.identity, deps.env, deps.bus);
  // Every new account gets a wallet, whichever module created it.
  deps.bus.on('identity.user_registered', ({ userId }) => service.ensureWallet(userId));
  return { router: (guards: AuthGuards, limits: RequestHandler[]) => createPaymentsRouter(service, guards, limits) };
}
