import type { RequestHandler } from 'express';
import type { AuthGuards } from '../../shared/http/auth';
import type { EventsApi } from '../events';
import type { IdentityApi } from '../identity';
import type { ProposalRepository } from './ports';
import { createProposalsRouter } from './routes';
import { ProposalsService, type PaymentView } from './service';

export type { PaymentView } from './service';
export type { ProposalRepository } from './ports';
export { payerOf, depositAmount } from './domain';
export type { ProposalRecord, ProposalStatus } from './domain';
export { SupabaseProposalRepository } from './infra/supabase.repository';

/** What the rest of the application may ask the proposals module. */
export interface ProposalsApi {
  countFundedFor(userId: string): Promise<number>;
  /** For a signed-in user who must be a party to the proposal. */
  getForPayment(id: string, requesterId: string): Promise<PaymentView | null>;
  /** For the payment webhook, which has no user. */
  getForPaymentUnchecked(id: string): Promise<PaymentView | null>;
  markEscrowFunded(id: string): Promise<void>;
}

export function createProposalsModule(deps: { repo: ProposalRepository; identity: IdentityApi; events: EventsApi }) {
  const service = new ProposalsService(deps.repo, deps.identity, deps.events);
  const api: ProposalsApi = {
    countFundedFor: (id) => service.countFundedFor(id),
    getForPayment: (id, who) => service.getForPayment(id, who),
    getForPaymentUnchecked: (id) => service.getForPaymentUnchecked(id),
    markEscrowFunded: (id) => service.markEscrowFunded(id),
  };
  return { api, router: (guards: AuthGuards, limits: RequestHandler[]) => createProposalsRouter(service, guards, limits) };
}
