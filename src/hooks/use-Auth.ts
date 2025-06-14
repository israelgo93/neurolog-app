// ================================================================
// src/hooks/useAuth.ts
// Hook useAuth mejorado con persistencia temporal en memoria
// ================================================================

'use client';

import { useCallback, useMemo, useContext } from 'react';
import { AuthContext } from '@/components/providers/AuthProvider';
import type { Profile } from '@/types';

// ================================================================
// CACHE TEMPORAL EN MEMORIA PARA PREVENIR PÉRDIDAS DE ESTADO
// ================================================================

interface UserCache {
  user: Profile | null;
  lastFetch: number;
  isValid: boolean;
}

// Cache temporal en memoria (se resetea en cada refresh de página)
let userCache: UserCache = {
  user: null,
  lastFetch: 0,
  isValid: false
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// ================================================================
// FUNCIONES HELPER PARA CACHE
// ================================================================

const getCachedUser = (): Profile | null => {
  const now = Date.now();
  if (userCache.isValid && userCache.user && (now - userCache.lastFetch < CACHE_DURATION)) {
    console.log('📋 Using cached user data:', userCache.user.full_name);
    return userCache.user;
  }
  return null;
};

const setCachedUser = (user: Profile | null): void => {
  userCache = {
    user,
    lastFetch: Date.now(),
    isValid: user !== null
  };
  if (user) {
    console.log('💾 Cached user data:', user.full_name);
  }
};

const clearUserCache = (): void => {
  userCache = {
    user: null,
    lastFetch: 0,
    isValid: false
  };
  console.log('🗑️ User cache cleared');
};

// ================================================================
// HOOK useAuth MEJORADO
// ================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  const { 
    user: contextUser, 
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
  } = context;

  // ================================================================
  // FUNCIONES MEJORADAS CON CACHE
  // ================================================================

  /**
   * ✅ Usuario con fallback a cache
   */
  const user = useMemo(() => {
    // Si hay usuario en contexto, actualizar cache y devolverlo
    if (contextUser) {
      setCachedUser(contextUser);
      return contextUser;
    }

    // Si no hay usuario en contexto pero está cargando, usar cache si está disponible
    if (loading) {
      const cachedUser = getCachedUser();
      if (cachedUser) {
        return cachedUser;
      }
    }

    // Si no está cargando y no hay usuario, limpiar cache
    if (!loading && !contextUser) {
      clearUserCache();
    }

    return contextUser;
  }, [contextUser, loading]);

  /**
   * ✅ Sign Out mejorado con limpieza de cache
   */
  const signOutWithCache = useCallback(async (): Promise<void> => {
    clearUserCache();
    await signOut();
  }, [signOut]);

  /**
   * ✅ Update Profile mejorado con actualización de cache
   */
  const updateProfileWithCache = useCallback(async (updates: Partial<Profile>): Promise<void> => {
    await updateProfile(updates);
    // El cache se actualizará automáticamente cuando el contexto se actualice
  }, [updateProfile]);

  /**
   * ✅ Refresh User mejorado
   */
  const refreshUserWithCache = useCallback(async (): Promise<void> => {
    await refreshUser();
    // El cache se actualizará automáticamente cuando el contexto se actualice
  }, [refreshUser]);

  /**
   * ✅ Función helper para verificar si el usuario está autenticado
   */
  const isAuthenticated = useMemo(() => {
    return !!user && !loading;
  }, [user, loading]);

  /**
   * ✅ Función helper para obtener el nombre de display del usuario
   */
  const displayName = useMemo(() => {
    if (!user) return 'Usuario';
    return user.full_name ?? user.email?.split('@')[0] ?? 'Usuario';
  }, [user]);

  /**
   * ✅ Función helper para obtener las iniciales del usuario
   */
  const userInitials = useMemo(() => {
    if (!user?.full_name) return 'U';
    return user.full_name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [user]);

  /**
   * ✅ Función helper para obtener el rol traducido
   */
  const roleDisplayName = useMemo(() => {
    if (!user?.role) return 'Usuario';
    
    const roleMap = {
      'parent': 'Padre/Madre',
      'teacher': 'Docente',
      'specialist': 'Especialista',
      'admin': 'Administrador'
    };
    
    return roleMap[user.role] ?? 'Usuario';
  }, [user]);

  /**
   * ✅ Debug info (solo en desarrollo)
   */
  const debugInfo = useMemo(() => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return {
      contextUser: !!contextUser,
      cachedUser: !!getCachedUser(),
      loading,
      error,
      cacheValid: userCache.isValid,
      cacheAge: userCache.lastFetch ? Date.now() - userCache.lastFetch : 0
    };
  }, [contextUser, loading, error]);

  // ================================================================
  // RETURN DEL HOOK
  // ================================================================

  return {
    // Estado principal
    user,
    loading,
    error,
    isAdmin,
    
    // Estado derivado
    isAuthenticated,
    displayName,
    userInitials,
    roleDisplayName,
    
    // Funciones de autenticación
    signIn,
    signUp,
    signOut: signOutWithCache,
    
    // Funciones de perfil
    updateProfile: updateProfileWithCache,
    refreshUser: refreshUserWithCache,
    resetPassword,
    
    // Utilidades
    clearError,
    
    // Debug (solo desarrollo)
    ...(process.env.NODE_ENV === 'development' && { debugInfo })
  };
}

// ================================================================
// HOOK AUXILIAR PARA REQUERIR AUTENTICACIÓN
// ================================================================

export function useRequireAuth() {
  const { user, loading, isAuthenticated } = useAuth();
  
  return {
    user,
    loading,
    isAuthenticated,
    requireAuth: !loading && !isAuthenticated
  };
}

// ================================================================
// HOOK AUXILIAR PARA VERIFICAR PERMISOS
// ================================================================

export function usePermissions() {
  const { user, isAdmin } = useAuth();
  
  const hasRole = useCallback((role: string | string[]) => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  }, [user]);
  
  const canManageUsers = useMemo(() => isAdmin, [isAdmin]);
  const canViewReports = useMemo(() => hasRole(['admin', 'specialist', 'teacher']), [hasRole]);
  const canEditChild = useMemo(() => hasRole(['admin', 'parent', 'teacher']), [hasRole]);
  
  return {
    hasRole,
    canManageUsers,
    canViewReports,
    canEditChild,
    isAdmin
  };
}