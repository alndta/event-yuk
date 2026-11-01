/** Roles an account can hold. One account holds exactly one of them. */
export const ROLES = ['EO', 'VENDOR', 'TALENT', 'TENANT', 'SPONSOR', 'CREW'] as const;
export type Role = (typeof ROLES)[number];

/** Who is making the request. Built by the identity module, read by everyone else. */
export interface AuthContext {
  userId: string;
  email: string;
  role: Role | null;
}

/** Anything that can turn a bearer token into an AuthContext (implemented by identity). */
export interface Authenticator {
  authenticate(token: string): Promise<AuthContext | null>;
}
