import type { Role } from '../../shared/types';

export type KycStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED';

export interface BankAccount {
  bank_code: string;
  account_number: string;
  account_holder: string;
}

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  phoneWa: string | null;
  passwordHash: string | null;
  kycStatus: KycStatus;
}

export interface ProfileRecord {
  userId: string;
  role: Role;
  businessName: string | null;
  cityRegion: string | null;
  ratingAvg: number | null;
  bankAccount: BankAccount | null;
}

export type ProfileWithUser = ProfileRecord & { fullName: string; kycStatus: KycStatus };

/** Everything the identity module needs to persist users and their single role profile. */
export interface UserRepository {
  findById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  /** Throws a 409 AppError when the email is taken. */
  create(input: { fullName: string; email: string; phoneWa?: string | null; passwordHash?: string | null }): Promise<UserRecord>;
  update(id: string, patch: Partial<{ fullName: string; phoneWa: string | null; passwordHash: string; kycStatus: KycStatus }>): Promise<void>;
  getProfile(userId: string): Promise<ProfileRecord | null>;
  /** Throws a 409 AppError when the user already has a role. */
  createProfile(input: { userId: string; role: Role; businessName: string; cityRegion: string | null }): Promise<ProfileRecord>;
  updateProfile(userId: string, patch: Partial<{ businessName: string; cityRegion: string; bankAccount: BankAccount }>): Promise<void>;
  listProfiles(role?: Role): Promise<ProfileWithUser[]>;
  getProfileWithUser(userId: string): Promise<ProfileWithUser | null>;
}

export interface OtpRecord {
  id: string;
  codeHash: string;
  attempts: number;
}

export interface OtpRepository {
  create(input: { identifier: string; codeHash: string; expiresAt: Date }): Promise<void>;
  countSince(identifier: string, since: Date): Promise<number>;
  findActive(identifier: string, now: Date): Promise<OtpRecord | null>;
  incrementAttempts(id: string): Promise<void>;
  markUsed(id: string): Promise<void>;
}

export interface VerifiedGoogleIdentity {
  email: string;
  fullName: string | null;
}

/** Confirms a Google sign-in with the identity provider; the client's claim is never trusted. */
export interface GoogleIdentityVerifier {
  verify(accessToken: string): Promise<VerifiedGoogleIdentity | null>;
}

export type KycDecision = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface KycSubmission {
  id: string;
  userId: string;
  status: KycDecision;
  rejectReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

/** NIK is never stored in the clear: only a keyed hash, enough to spot one ID used by two accounts. */
export interface KycRepository {
  /** Throws a 409 AppError when the same NIK hash is already pending or approved on another account. */
  create(input: { userId: string; nikHash: string }): Promise<KycSubmission>;
  latestFor(userId: string): Promise<KycSubmission | null>;
  listPending(): Promise<(KycSubmission & { fullName: string; email: string })[]>;
  decide(input: { userId: string; status: 'APPROVED' | 'REJECTED'; reviewerId: string; reason: string | null }): Promise<void>;
  addDocument(input: { userId: string; kind: KycDocumentKind; path: string; contentType: string; size: number }): Promise<void>;
  /** The newest document of each kind. */
  listDocuments(userId: string): Promise<KycDocument[]>;
}

export type KycDocumentKind = 'KTP' | 'SELFIE';

export interface KycDocument {
  id: string;
  userId: string;
  kind: KycDocumentKind;
  path: string;
  contentType: string;
  size: number;
  createdAt: string;
}

/** Private file storage for identity documents. Files are never public; admins get short-lived links. */
export interface DocumentStore {
  put(path: string, body: Buffer, contentType: string): Promise<void>;
  signedUrl(path: string, expiresInSeconds: number): Promise<string>;
}
