import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { hasSupabaseKeys } from '../lib/env';
import { AuthContext } from './authContextValue';
import type { AuthContextType, Profile, SignUpResult } from './authContextValue';

// Import dinâmico: o @supabase/supabase-js (~47KB gzip) continua fora do bundle
// inicial da loja e é baixado em paralelo, depois do primeiro paint.
const loadSupabase = () => import('../lib/supabase').then(m => m.supabase);

const translateAuthError = (message: string): string => {
  if (/invalid login credentials/i.test(message)) return 'E-mail ou senha incorretos.';
  if (/email not confirmed/i.test(message)) return 'Confirme seu e-mail pelo link que enviamos antes de entrar.';
  if (/already registered/i.test(message)) return 'Já existe uma conta com este e-mail.';
  if (/password should be at least/i.test(message)) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (/rate limit/i.test(message)) return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.';
  return message;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // Id do usuário cujo perfil já foi consultado — evita tratar como "não admin"
  // o intervalo entre o login e a resposta da consulta do perfil.
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [isSessionChecked, setIsSessionChecked] = useState(!hasSupabaseKeys);

  useEffect(() => {
    if (!hasSupabaseKeys) {
      return;
    }

    let isActive = true;
    let unsubscribe: (() => void) | undefined;

    const loadProfile = async (currentSession: Session | null): Promise<void> => {
      if (!currentSession) {
        setProfile(null);
        setProfileUserId(null);
        return;
      }
      const supabase = await loadSupabase();
      const { data } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', currentSession.user.id)
        .maybeSingle();
      if (!isActive) return;
      setProfile(data ? { name: data.name ?? '', role: data.role === 'admin' ? 'admin' : 'customer' } : null);
      setProfileUserId(currentSession.user.id);
    };

    void loadSupabase().then(async supabase => {
      if (!isActive) return;

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!isActive) return;
      setSession(currentSession);
      await loadProfile(currentSession);
      if (isActive) setIsSessionChecked(true);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
        if (!isActive) return;
        setSession(nextSession);
        // TOKEN_REFRESHED não muda o usuário — evita refazer a consulta do perfil
        if (event !== 'TOKEN_REFRESHED') {
          // Fora do callback: chamadas ao supabase dentro dele podem travar o client
          setTimeout(() => { void loadProfile(nextSession); }, 0);
        }
      });
      unsubscribe = () => subscription.unsubscribe();
    });

    return () => {
      isActive = false;
      unsubscribe?.();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const supabase = await loadSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? translateAuthError(error.message) : null;
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string): Promise<SignUpResult> => {
    const supabase = await loadSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/conta`,
      },
    });
    if (error) {
      return { error: translateAuthError(error.message), needsConfirmation: false };
    }
    return { error: null, needsConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    const supabase = await loadSupabase();
    await supabase.auth.signOut();
  }, []);

  const getFreshSession = useCallback(async (): Promise<Session | null> => {
    if (!hasSupabaseKeys) return null;
    const supabase = await loadSupabase();
    const { data } = await supabase.auth.getSession();
    return data.session;
  }, []);

  const isAuthReady = isSessionChecked && (!session || profileUserId === session.user.id);

  const value = useMemo<AuthContextType>(() => ({
    session,
    profile,
    isAdmin: isAuthReady && profile?.role === 'admin',
    isAuthReady,
    signIn,
    signUp,
    signOut,
    getFreshSession,
  }), [session, profile, isAuthReady, signIn, signUp, signOut, getFreshSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
