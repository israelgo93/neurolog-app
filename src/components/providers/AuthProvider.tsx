// src/components/providers/AuthProvider.tsx
// AuthProvider CORREGIDO - Soluciona el problema del nombre que se oculta

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
// AUTH PROVIDER COMPONENT - VERSIÓN CORREGIDA
// ================================================================

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  //  USAR useRef PARA MANTENER REFERENCIAS ESTABLES
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  
  //  REF PARA CONTROLAR INICIALIZACIÓN Y MONTAJE
  const initializedRef = useRef(false);
  const mountedRef = useRef(true);
  const authSubscriptionRef = useRef<any>(null);

  // ================================================================
  // FUNCIONES HELPER ESTABILIZADAS CON useCallback
  // ================================================================

  /**
   *  FETCH PROFILE - MEJORADO CON MEJOR MANEJO DE ERRORES
   */
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      //  CAMBIO: .maybeSingle() en lugar de .single()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // ← ESTO ELIMINA EL ERROR 406

      if (error) {
        console.error('❌ Error fetching profile:', error);
        return null;
      }

      //  Si no existe el perfil, crearlo automáticamente
      if (!data) {
        console.log('ℹ️ Profile not found, creating new profile...');
        
        const { data: authUser, error: authError } = await supabase.auth.getUser();
        
        if (authUser?.user && !authError) {
          const userData = authUser.user;
          const fullName = userData.user_metadata?.full_name || 
                          userData.user_metadata?.name ||
                          userData.email?.split('@')[0] || 
                          'Usuario';
          
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
          
          if (createError) {
            console.error('❌ Error creating profile:', createError);
            return null;
          }
          
          console.log('✅ Profile created successfully:', newProfile.full_name);
          return newProfile as Profile;
        }
        
        return null;
      }

      console.log('✅ Profile fetched successfully:', data.full_name);
      return data as Profile;
    } catch (err) {
      console.error('❌ Unexpected error fetching profile:', err);
      return null;
    }
  }, [supabase]);

  /**
   *  CHECK ADMIN STATUS - ESTABILIZADA
   */
  const checkAdminStatus = useCallback(async (userId: string): Promise<boolean> => {
    try {
      //  CAMBIO: .maybeSingle() aquí también
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle(); // ← ESTO TAMBIÉN PREVIENE ERRORES

      if (error) {
        console.warn('⚠️ Could not check admin status:', error);
        return false;
      }

      if (!data) {
        console.warn('⚠️ No profile found for admin check');
        return false;
      }

      return data.role === 'admin';
    } catch (err) {
      console.error('❌ Error checking admin status:', err);
      return false;
    }
  }, [supabase]);

  /**
   *  UPDATE LAST LOGIN - ESTABILIZADA
   */
  const updateLastLogin = useCallback(async (userId: string): Promise<void> => {
    try {
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch (err) {
      console.warn('⚠️ Could not update last login:', err);
    }
  }, [supabase]);

  // ================================================================
  // FUNCIONES DE AUTENTICACIÓN ESTABILIZADAS
  // ================================================================

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // El perfil se cargará automáticamente por el listener
    } catch (err: any) {
      console.error('❌ Sign in error:', err);
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
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('❌ Sign up error:', err);
      setError(err.message || 'Error al registrarse');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      //  LIMPIAR ESTADO INMEDIATAMENTE
      setUser(null);
      setIsAdmin(false);
      setError(null);
    } catch (err: any) {
      console.error('❌ Sign out error:', err);
      setError(err.message || 'Error al cerrar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const updateProfile = useCallback(async (updates: Partial<Profile>): Promise<void> => {
    if (!user) throw new Error('No user logged in');

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      //  ACTUALIZAR ESTADO LOCAL INMEDIATAMENTE
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (err: any) {
      console.error('❌ Update profile error:', err);
      setError(err.message || 'Error al actualizar perfil');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (err: any) {
      console.error('❌ Reset password error:', err);
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
        if (mountedRef.current) {
          setIsAdmin(adminStatus);
        }
      }
    } catch (err) {
      console.error('❌ Error refreshing user:', err);
    }
  }, [user, fetchProfile, checkAdminStatus]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ================================================================
  // EFECTO PRINCIPAL - INICIALIZACIÓN UNA SOLA VEZ
  // ================================================================

  useEffect(() => {
    //  PREVENIR MÚLTIPLES INICIALIZACIONES
    if (initializedRef.current) return;
    
    initializedRef.current = true;
    mountedRef.current = true;

    console.log('🚀 Initializing AuthProvider (ONE TIME ONLY)...');

    /**
     *  FUNCIÓN DE INICIALIZACIÓN ÚNICA
     */
    const initializeAuth = async (): Promise<void> => {
      try {
        console.log('🔍 Getting initial session...');
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mountedRef.current) {
          console.log('✅ Session found, fetching profile...');
          
          await updateLastLogin(session.user.id);
          
          const profile = await fetchProfile(session.user.id);
          
          if (profile && mountedRef.current) {
            setUser(profile);
            
            const adminStatus = await checkAdminStatus(session.user.id);
            if (mountedRef.current) {
              setIsAdmin(adminStatus);
            }
          }
        } else {
          console.log('ℹ️ No active session found');
        }
      } catch (err) {
        console.error('❌ Error during initialization:', err);
        if (mountedRef.current) {
          setError('Error al cargar la sesión');
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    /**
     *  LISTENER DE AUTH MEJORADO - UNA SOLA SUBSCRIPCIÓN
     */
    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mountedRef.current) return;

          console.log('🔄 Auth state changed:', event);

          try {
            if (event === 'SIGNED_IN' && session?.user) {
              console.log('✅ User signed in, fetching profile...');
              setLoading(true);
              
              await updateLastLogin(session.user.id);
              
              const profile = await fetchProfile(session.user.id);
              if (profile && mountedRef.current) {
                setUser(profile);
                
                const adminStatus = await checkAdminStatus(session.user.id);
                if (mountedRef.current) {
                  setIsAdmin(adminStatus);
                }
              }
            } else if (event === 'SIGNED_OUT') {
              console.log('👋 User signed out');
              if (mountedRef.current) {
                setUser(null);
                setIsAdmin(false);
                setError(null);
              }
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
              console.log('🔄 Token refreshed, maintaining user state');
              // No necesitamos recargar el perfil en token refresh
              // El usuario ya está cargado y el token se renovó automáticamente
            }
          } catch (err) {
            console.error('❌ Error handling auth state change:', err);
            if (mountedRef.current) {
              setError('Error en el cambio de estado de autenticación');
            }
          } finally {
            if (mountedRef.current) {
              setLoading(false);
            }
          }
        }
      );

      authSubscriptionRef.current = subscription;
      return subscription;
    };

    //  INICIALIZAR TODO
    initializeAuth();
    setupAuthListener();

    //  CLEANUP FUNCTION
    return () => {
      console.log('🧹 Cleaning up AuthProvider...');
      mountedRef.current = false;
      
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe();
        authSubscriptionRef.current = null;
      }
    };
  }, []); //  DEPENDENCIAS VACÍAS - SOLO EJECUTAR UNA VEZ

  // ================================================================
  // CLEANUP ON UNMOUNT
  // ================================================================
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ================================================================
  // CONTEXT VALUE MEMOIZADO PARA EVITAR RE-RENDERS INNECESARIOS
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