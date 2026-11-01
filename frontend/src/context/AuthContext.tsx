import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../components/RoleOnboardingModal';
import { supabase } from '../lib/supabase';
import { api, ApiError, TOKEN_KEY, UNAUTHORIZED_EVENT } from '../lib/api';

export interface UserSession {
  id: string;
  fullName: string;
  email: string;
  kycStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED';
  activeRole: UserRole | null;
  businessName?: string;
  cityRegion?: string;
  phoneWa?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; activeRole?: UserRole | null; error?: string }>;
  register: (userData: { email: string; password?: string }) => Promise<{ success: boolean; activeRole?: UserRole | null; error?: string }>;
  setAccountRole: (roleData: {
    role_type: UserRole;
    business_name: string;
    city_region: string;
    category?: string;
    phone_wa?: string;
    bio_description?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  requireAuth: (action: () => void, promptMessage?: string) => boolean;
  authPromptModalOpen: boolean;
  authPromptMessage: string;
  closeAuthPrompt: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('event_yuk_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Clean production default: no hardcoded auto-login
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY) || null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [authPromptModalOpen, setAuthPromptModalOpen] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState('');

  useEffect(() => {
    if (user) {
      localStorage.setItem('event_yuk_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('event_yuk_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  const toSession = (u: any, role: UserRole | null, avatar?: string): UserSession => ({
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    kycStatus: u.kyc_status || 'UNVERIFIED',
    activeRole: role,
    businessName: u.business_name || undefined,
    cityRegion: u.city_region || undefined,
    phoneWa: u.phone_wa || undefined,
    avatarUrl: avatar || '/assets/crew-production.jpg',
  });

  const clearSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('event_yuk_user');
    localStorage.removeItem(TOKEN_KEY);
  };

  // The backend says the token is no longer valid: leave the signed-in state cleanly.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, clearSession);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, clearSession);
  }, []);

  // On load, refresh the saved account from the server so role and KYC status are never stale.
  useEffect(() => {
    if (!token) return;
    api('/users/me')
      .then((data) => setUser((prev) => toSession(data.user, (data.user.active_role || null) as UserRole | null, prev?.avatarUrl)))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Google sign-in: the backend verifies the Supabase access token itself and issues our own session.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event !== 'SIGNED_IN' || !session?.access_token) return;
      try {
        const data = await api('/auth/google-sync', { method: 'POST', anonymous: true, body: { access_token: session.access_token } });
        setUser(toSession(data.user, (data.activeRole || data.user.active_role || null) as UserRole | null, session.user?.user_metadata?.avatar_url));
        setToken(data.token);
      } catch (e) {
        console.warn('Google sync failed:', e);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api('/auth/login', { method: 'POST', anonymous: true, body: { email, password } });
      const role = (data.activeRole || data.user.active_role || null) as UserRole | null;
      setUser(toSession(data.user, role));
      setToken(data.token);
      return { success: true, activeRole: role };
    } catch (err) {
      return { success: false, error: err instanceof ApiError ? err.message : 'Gagal masuk. Coba lagi.' };
    } finally {
      setIsLoading(false);
    }
  };

  /** Registration itself happens on the register page (email code); this signs the new account in. */
  const register = async (userData: { email: string; password?: string }) => {
    return login(userData.email, userData.password || '');
  };

  const setAccountRole = async (roleData: {
    role_type: UserRole;
    business_name: string;
    city_region: string;
    category?: string;
    phone_wa?: string;
    bio_description?: string;
  }) => {
    if (!user) return { success: false, error: 'Kamu belum masuk.' };
    setIsLoading(true);
    try {
      const data = await api('/users/roles/set-role', {
        method: 'POST',
        body: { role_type: roleData.role_type, business_name: roleData.business_name, city_region: roleData.city_region, phone_wa: roleData.phone_wa || undefined },
      });
      setUser(toSession(data.user, roleData.role_type, user.avatarUrl));
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof ApiError ? err.message : 'Gagal menyimpan peran akun.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Gagal memulai autentikasi Google.' };
    }
  };

  const logout = () => {
    supabase.auth.signOut().catch(() => {});
    clearSession();
  };

  const requireAuth = (action: () => void, promptMessage = 'Aksi ini memerlukan akun terdaftar.') => {
    if (user && token) {
      action();
      return true;
    }
    setAuthPromptMessage(promptMessage);
    setAuthPromptModalOpen(true);
    return false;
  };

  const closeAuthPrompt = () => {
    setAuthPromptModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        setAccountRole,
        signInWithGoogle,
        logout,
        requireAuth,
        authPromptModalOpen,
        authPromptMessage,
        closeAuthPrompt,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
