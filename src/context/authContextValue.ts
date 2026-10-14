import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';

export type UserRole = 'customer' | 'admin';

export interface Profile {
  name: string;
  role: UserRole;
}

export interface SignUpResult {
  error: string | null;
  /** true quando o Supabase exige confirmar o e-mail antes do primeiro login */
  needsConfirmation: boolean;
}

export interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  /** false até a sessão salva (se houver) ter sido lida */
  isAuthReady: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (name: string, email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  /** Sessão com token válido (renova se expirado) — para chamadas REST fora do supabase-js */
  getFreshSession: () => Promise<Session | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
