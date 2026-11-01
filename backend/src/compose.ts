import type { AppDeps } from './app';
import type { Env } from './shared/config/env';
import { createDb } from './shared/db/supabase';
import { createMailer } from './shared/mail/mailer';
import { SupabaseCatalogRepository } from './modules/catalog';
import { SupabaseEventRepository } from './modules/events';
import { SupabaseDocumentStore, SupabaseGoogleVerifier, SupabaseKycRepository, SupabaseOtpRepository, SupabaseUserRepository } from './modules/identity';
import { MidtransGateway, SupabasePaymentsRepository } from './modules/payments';
import { SupabaseProposalRepository } from './modules/proposals';

/** The real wiring: Supabase for storage, Midtrans for payments, SMTP for mail. */
export function productionDeps(env: Env): AppDeps {
  const db = createDb(env);
  return {
    env,
    users: new SupabaseUserRepository(db),
    otps: new SupabaseOtpRepository(db),
    kyc: new SupabaseKycRepository(db),
    documents: new SupabaseDocumentStore(db),
    events: new SupabaseEventRepository(db),
    catalog: new SupabaseCatalogRepository(db),
    proposals: new SupabaseProposalRepository(db),
    payments: new SupabasePaymentsRepository(db),
    google: new SupabaseGoogleVerifier(db),
    mailer: createMailer(env),
    gateway: new MidtransGateway(env),
  };
}
