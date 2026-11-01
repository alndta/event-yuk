import type { Env } from '../../shared/config/env';
import type { TokenService } from '../../shared/crypto/jwt';
import type { EventBus } from '../../shared/events/bus';
import type { AuthGuards } from '../../shared/http/auth';
import type { Mailer } from '../../shared/mail/mailer';
import type { Authenticator, Role } from '../../shared/types';
import type { DocumentStore, GoogleIdentityVerifier, KycRepository, OtpRepository, UserRepository } from './ports';
import { createIdentityRouter, type IdentityLimiters } from './routes';
import { IdentityService, type PublicProfile } from './service';

export type { PublicProfile } from './service';
export type { OtpRepository, UserRepository, KycRepository, DocumentStore, GoogleIdentityVerifier } from './ports';
export { SupabaseKycRepository, SupabaseDocumentStore } from './infra/kyc.repository';
export { SupabaseOtpRepository, SupabaseUserRepository } from './infra/supabase.repository';
export { SupabaseGoogleVerifier } from './infra/google.verifier';

/** What the rest of the application may ask the identity module. Nothing else is importable. */
export interface IdentityApi extends Authenticator {
  getPublicProfile(userId: string): Promise<PublicProfile | null>;
  listPublicProfiles(role?: Role): Promise<PublicProfile[]>;
  getContact(userId: string): Promise<{ fullName: string; email: string } | null>;
}

export interface IdentityDeps {
  users: UserRepository;
  otps: OtpRepository;
  kyc: KycRepository;
  documents: DocumentStore;
  google: GoogleIdentityVerifier;
  mailer: Mailer;
  tokens: TokenService;
  bus: EventBus;
  env: Env;
}

export function createIdentityModule(deps: IdentityDeps) {
  const service = new IdentityService(deps);
  const api: IdentityApi = {
    authenticate: (token) => service.authenticate(token),
    getPublicProfile: (id) => service.getPublicProfile(id),
    listPublicProfiles: (role) => service.listPublicProfiles(role),
    getContact: (id) => service.getContact(id),
  };
  return {
    api,
    /** Scheduled maintenance, run by main.ts. */
    jobs: { purgeKycPhotos: (now?: Date) => service.purgeApprovedPhotos(now) },
    router: (guards: AuthGuards, limits: IdentityLimiters) => createIdentityRouter(service, guards, limits, deps.env.exposeOtpPreview),
  };
}
