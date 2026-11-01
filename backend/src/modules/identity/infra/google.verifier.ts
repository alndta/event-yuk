import type { Db } from '../../../shared/db/supabase';
import type { GoogleIdentityVerifier, VerifiedGoogleIdentity } from '../ports';

/**
 * The browser signs in with Google through Supabase Auth and sends us the resulting access token.
 * We ask Supabase who that token belongs to instead of believing an email address from the client.
 */
export class SupabaseGoogleVerifier implements GoogleIdentityVerifier {
  constructor(private readonly db: Db) {}

  async verify(accessToken: string): Promise<VerifiedGoogleIdentity | null> {
    const { data, error } = await this.db.auth.getUser(accessToken);
    const user = data?.user;
    if (error || !user?.email || !user.email_confirmed_at) return null;
    if (user.app_metadata?.provider !== 'google') return null;
    const name = user.user_metadata?.full_name ?? user.user_metadata?.name;
    return { email: user.email, fullName: typeof name === 'string' ? name : null };
  }
}
