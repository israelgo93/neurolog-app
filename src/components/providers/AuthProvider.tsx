// src/components/providers/AuthProvider.tsx
// AuthProvider - Refactorizado para menor Cognitive Complexity

'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
  useCallback,
  useMemo
} from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types';

// ================================================================
// TIPOS DEL CONTEXTO
// ================================================================

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ================================================================
// PROVIDER PROPS
// ================================================================

interface AuthProviderProps {
  children: ReactNode;
}

// ================================================================
// FUNCIONES AUXILIARES (fuera del componente para menor complejidad)
// ================================================================

const getFullName = (userData: any) => (
  userData.user_metadata?.full_name ||
  userData.user_metadata?.name ||
  userData.email?.split('@')[0] ||
  'Usuario'
);

// ================================================================
// AUTH PROVIDER COMPONENT
// ================================================================

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const initializedRef = useRef(false);
  const mountedRef = useRef(true);
  const authSubscriptionRef = useRef<any>(null);

  // ================================================================
  // FUNCIONES PRINCIPALES SEPARADAS Y SIMPLIFICADAS
  // ================================================================

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) return null;

      if (data) return data as Profile;

      // Crear perfil si no existe
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      if (!authUser?.user || authError) return null;

      const userData = authUser.user;
      const fullName = getFullName(userData);

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userData.email || '',
          full_name: fullName,
          role: userData.user_metadata?.role || 'parent',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) return null;
      return newProfile as Profile;
    } catch {
      return null;
    }
  }, [supabase]);

  const checkAdminStatus = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      if (error || !data) return false;
      return data.role === 'admin';
    } catch {
      return false;
    }
  }, [supabase]);

  const updateLastLogin = useCallback(async (userId: string): Promise<void> => {
    try {
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch {
      // opcionalmente manejar error
    }
  }, [supabase]);

  // ================================================================
  // AUTENTICACIÓN (Funciones agrupadas)
  // ================================================================

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role }
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const signOut = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setIsAdmin(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cerrar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const updateProfile = useCallback(async (updates: Partial<Profile>): Promise<void> => {
    if (!user) throw new Error('No user logged in');
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) throw error;
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar perfil');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Error al enviar email de recuperación');
      throw err;
    }
  }, [supabase]);

  const refreshUser = useCallback(async (): Promise<void> => {
    if (!user) return;
    try {
      const profile = await fetchProfile(user.id);
      if (profile && mountedRef.current) {
        setUser(profile);
        const adminStatus = await checkAdminStatus(user.id);
        if (mountedRef.current) setIsAdmin(adminStatus);
      }
    } catch { }
  }, [user, fetchProfile, checkAdminStatus]);

  const clearError = useCallback(() => setError(null), []);

  // ================================================================
  // EFECTO PRINCIPAL - INICIALIZACIÓN Y LISTENER SEPARADOS
  // ================================================================

  // --- Función: Manejar eventos de cambio de autenticación ---
  const handleSignedIn = useCallback(async (user: User) => {
    setLoading(true);
    await updateLastLogin(user.id);
    const profile = await fetchProfile(user.id);
    if (profile && mountedRef.current) {
      setUser(profile);
      const adminStatus = await checkAdminStatus(user.id);
      if (mountedRef.current) setIsAdmin(adminStatus);
    }
  }, [fetchProfile, checkAdminStatus, updateLastLogin]);

  const handleSignedOut = useCallback(() => {
    if (mountedRef.current) {
      setUser(null);
      setIsAdmin(false);
      setError(null);
    }
  }, []);

  const handleAuthChange = useCallback(async (event: string, session: any) => {
    if (!mountedRef.current) return;
    try {
      if (event === 'SIGNED_IN' && session?.user) {
        await handleSignedIn(session.user);
      } else if (event === 'SIGNED_OUT') {
        handleSignedOut();
      }
      // TOKEN_REFRESHED no requiere acción
    } catch {
      if (mountedRef.current) setError('Error en el cambio de estado de autenticación');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [handleSignedIn, handleSignedOut]);

  // --- Función: Inicializar sesión ---
  const initializeAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mountedRef.current) {
        await handleSignedIn(session.user);
      }
    } catch {
      if (mountedRef.current) setError('Error al cargar la sesión');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [supabase, handleSignedIn]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    mountedRef.current = true;

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => { handleAuthChange(event, session); }
    );
    authSubscriptionRef.current = subscription;

    return () => {
      mountedRef.current = false;
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe();
        authSubscriptionRef.current = null;
      }
    };
  }, [initializeAuth, handleAuthChange, supabase]);

  // ================================================================
  // CLEANUP ON UNMOUNT
  // ================================================================

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  // ================================================================
  // CONTEXT VALUE MEMOIZADO
  // ================================================================

  const contextValue = useMemo<AuthContextType>(() => ({
    user,
    loading,
    error,
    isAdmin,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    refreshUser,
    clearError
  }), [
    user,
    loading,
    error,
    isAdmin,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    refreshUser,
    clearError
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ================================================================
// HOOK PERSONALIZADO
// ================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
