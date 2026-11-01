import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export type RoleType = 'EO' | 'VENDOR' | 'TALENT' | 'TENANT' | 'SPONSOR' | 'CREW' | 'ADMIN';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    activeRole: RoleType;
  };
}

/**
 * RBAC Middleware: Verifies whether the requesting user has the required role
 * Reads 'x-user-id' and 'x-user-role' headers (or JWT payload in production)
 */
export function requireRole(allowedRoles: RoleType[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || 'a0000000-0000-0000-0000-000000000001';
      const requestedRole = (req.headers['x-user-role'] as RoleType) || 'EO';

      // 1. Verify if user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, kyc_status')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return res.status(401).json({
          success: false,
          error: 'Autentikasi gagal. Akun pengguna tidak ditemukan.',
        });
      }

      // 2. Check if user has this profile role in user_profiles_roles
      const { data: profileRole } = await supabase
        .from('user_profiles_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role_type', requestedRole)
        .maybeSingle();

      // If role does not exist yet, allow seamless auto-activation (FR-AUTH-02)
      if (!profileRole) {
        await supabase.from('user_profiles_roles').insert({
          user_id: userId,
          role_type: requestedRole,
          business_name: user.email.split('@')[0],
        });
      }

      // 3. Verify if requested role is in allowedRoles
      if (!allowedRoles.includes(requestedRole)) {
        return res.status(403).json({
          success: false,
          error: `Akses ditolak. Fitur ini memerlukan peran salah satu dari: [${allowedRoles.join(', ')}]. Peran aktif Anda saat ini: ${requestedRole}.`,
        });
      }

      // Attach to request object
      req.user = {
        id: user.id,
        email: user.email,
        activeRole: requestedRole,
      };

      next();
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  };
}
