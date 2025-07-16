// src/hooks/use-logs.ts
// Hook COMPLETAMENTE CORREGIDO - Sin memory leaks ni suscripciones múltiples

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient, userCanAccessChild, userCanEditChild, auditSensitiveAccess } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import type { 
  LogWithDetails, 
  DailyLog, 
  LogInsert, 
  LogUpdate, 
  LogFilters,
  DashboardStats
} from '@/types';

// ================================================================
// INTERFACES DEL HOOK
// ================================================================

interface UseLogsOptions {
  childId?: string;
  includePrivate?: boolean;
  includeDeleted?: boolean;
  autoRefresh?: boolean;
  realtime?: boolean;
  pageSize?: number;
}

interface UseLogsReturn {
  logs: LogWithDetails[];
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  createLog: (logData: LogInsert) => Promise<DailyLog>;
  updateLog: (id: string, updates: LogUpdate) => Promise<DailyLog>;
  deleteLog: (id: string) => Promise<void>;
  markAsReviewed: (id: string, specialistNotes?: string) => Promise<void>;
  addParentFeedback: (id: string, feedback: string) => Promise<void>;
  togglePrivacy: (id: string) => Promise<void>;
  loadMore: () => Promise<void>;
  refreshLogs: () => Promise<void>;
  filterLogs: (filters: LogFilters) => LogWithDetails[];
  exportLogs: (format: 'csv' | 'pdf', filters?: LogFilters) => Promise<void>;
  getLogById: (id: string) => LogWithDetails | undefined;
  canEditLog: (logId: string) => Promise<boolean>;
}

// ================================================================
// HOOK PRINCIPAL - CORREGIDO COMPLETAMENTE
// ================================================================

export function useLogs(options: UseLogsOptions = {}): UseLogsReturn {
  const {
    childId,
    includePrivate = false,
    includeDeleted = false,
    autoRefresh = true,
    realtime = true,
    pageSize = 20
  } = options;

  const { user } = useAuth();
  const [logs, setLogs] = useState<LogWithDetails[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_children: 0,
    total_logs: 0,
    logs_this_week: 0,
    logs_this_month: 0,
    active_categories: 0,
    pending_reviews: 0,
    follow_ups_due: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  
  //  REFERENCIAS ESTABLES - PREVIENEN RE-RENDERS
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const mountedRef = useRef(true);
  const channelRef = useRef<any>(null);
  const lastOptionsRef = useRef<UseLogsOptions>(options);
  
  //  MEMOIZAR userId PARA EVITAR RE-RENDERS
  const userId = useMemo(() => user?.id, [user?.id]);
  
  //  GENERAR ID ÚNICO PARA CANAL REALTIME
  const channelId = useMemo(() => {
    const base = childId ? `logs:${childId}` : 'logs:all';
    const timestamp = Date.now();
    return `${base}:${timestamp}`;
  }, [childId]);

  //  VERIFICAR SI LAS OPCIONES CAMBIARON
  const optionsChanged = useMemo(() => {
    const prev = lastOptionsRef.current;
    const current = options;
    
    return (
      prev.childId !== current.childId ||
      prev.includePrivate !== current.includePrivate ||
      prev.includeDeleted !== current.includeDeleted ||
      prev.pageSize !== current.pageSize
    );
  }, [options]);

  // ================================================================
  // FUNCIÓN HELPER PARA OBTENER IDs DE NIÑOS ACCESIBLES
  // ================================================================
  
  const getAccessibleChildrenIds = useCallback(async (): Promise<string[]> => {
    if (!userId) return [];
    
    try {
      // Usar la tabla user_child_relations con verificación de existencia
      const { data, error } = await supabase
        .from('user_child_relations')
        .select('child_id')
        .eq('user_id', userId)
        .eq('is_active', true);
      
      if (error) {
        console.error('Error en user_child_relations:', error);
        // Si la tabla no existe, intentar con children directamente
        const { data: childrenData, error: childrenError } = await supabase
          .from('children')
          .select('id')
          .eq('created_by', userId);
          
        if (childrenError) throw childrenError;
        return childrenData?.map(child => child.id) || [];
      }
      
      return data?.map(relation => relation.child_id) || [];
    } catch (err) {
      console.error('❌ Error getting accessible children:', err);
      return [];
    }
  }, [userId, supabase]);

  // ================================================================
  // HELPER FUNCTIONS - EXTRAÍDAS PARA REDUCIR COMPLEJIDAD
  // ================================================================

  /**
   * Maneja el caso cuando no hay niños accesibles
   */
  const handleNoAccessibleChildren = useCallback(() => {
    if (mountedRef.current) {
      setLogs([]);
      setHasMore(false);
      setLoading(false);
    }
  }, []);

  /**
   * Construye la query base para obtener logs
   */
  const buildBaseQuery = useCallback((accessibleChildrenIds: string[], page: number) => {
    return supabase
      .from('daily_logs')
      .select(`
        *,
        children!inner(id, name, avatar_url),
        categories(id, name, color, icon),
        profiles!daily_logs_logged_by_fkey(id, full_name, avatar_url)
      `)
      .in('child_id', accessibleChildrenIds)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);
  }, [supabase, pageSize]);

  /**
   * Aplica filtros a la query
   */
  const applyQueryFilters = useCallback((query: any, accessibleChildrenIds: string[]) => {
    // Early return si childId no es accesible
    if (childId && !accessibleChildrenIds.includes(childId)) {
      throw new Error('No tienes acceso a este niño');
    }

    // Filtrar por niño específico
    if (childId) {
      query = query.eq('child_id', childId);
    }

    // Filtrar por privacidad
    if (!includePrivate) {
      query = query.eq('is_private', false);
    }

    return query;
  }, [childId, includePrivate]);

  /**
   * Transforma los datos de logs con valores por defecto
   */
  const transformLogsData = useCallback((data: any[]): LogWithDetails[] => {
    return (data ?? []).map(log => {
      const child = log.children ?? { id: log.child_id, name: 'Niño desconocido', avatar_url: null };
      const category = log.categories ?? { id: '', name: 'Sin categoría', color: '#gray', icon: 'circle' };
      const loggedByProfile = log.profiles ?? { id: log.logged_by, full_name: 'Usuario desconocido', avatar_url: null };
      
      return {
        ...log,
        child,
        category,
        logged_by_profile: loggedByProfile,
        // Propiedades auxiliares para compatibilidad con componentes existentes
        child_name: child.name,
        child_avatar_url: child.avatar_url,
        category_name: category?.name || null,
        category_color: category?.color || null,
        logged_by_name: loggedByProfile.full_name,
        logged_by_avatar: loggedByProfile.avatar_url,
        reviewer_name: null, // Se debe obtener de otra consulta si es necesario
        can_edit: true // Se debe verificar con permisos reales
      };
    }) as LogWithDetails[];
  }, []);

  /**
   * Actualiza el estado con los nuevos logs
   */
  const updateLogsState = useCallback((newLogs: LogWithDetails[], append: boolean) => {
    if (!mountedRef.current) return;

    if (append) {
      setLogs(prev => [...prev, ...newLogs]);
    } else {
      setLogs(newLogs);
    }
    
    setHasMore(newLogs.length === pageSize);
    console.log(`✅ Logs fetched successfully: ${newLogs.length}`);
  }, [pageSize]);

  /**
   * Maneja errores de fetch con mejor formateo
   */
  const handleFetchError = useCallback((err: any) => {
    console.error('❌ Error fetching logs:', err);
    if (mountedRef.current) {
      let errorMessage = 'Error al cargar los registros';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object') {
        // Manejar errores de Supabase
        if (err.message) {
          errorMessage = err.message;
        } else if (err.error_description) {
          errorMessage = err.error_description;
        } else if (err.error) {
          errorMessage = typeof err.error === 'string' ? err.error : JSON.stringify(err.error);
        } else if (err.details) {
          errorMessage = err.details;
        } else if (err.hint) {
          errorMessage = err.hint;
        } else {
          // Solo mostrar propiedades relevantes del error
          const relevantProps = Object.keys(err).filter(key => 
            key !== 'stack' && key !== 'name' && typeof err[key] !== 'function'
          );
          if (relevantProps.length > 0) {
            const errorObj = relevantProps.reduce((acc, key) => {
              acc[key] = err[key];
              return acc;
            }, {} as any);
            errorMessage = `Error: ${JSON.stringify(errorObj)}`;
          }
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    }
  }, []);

  // ================================================================
  // FUNCIÓN FETCH LOGS REFACTORIZADA
  // ================================================================

  const fetchLogs = useCallback(async (page: number = 0, append: boolean = false): Promise<void> => {
    if (!userId) return;

    try {
      if (!append) {
        setLoading(true);
        setError(null);
      }

      console.log(`📊 Fetching logs - Page: ${page}, Append: ${append}`);
      
      // Obtener niños accesibles
      const accessibleChildrenIds = await getAccessibleChildrenIds();
      if (accessibleChildrenIds.length === 0) {
        handleNoAccessibleChildren();
        return;
      }

      // Construir query base
      let query = buildBaseQuery(accessibleChildrenIds, page);

      // Aplicar filtros
      query = applyQueryFilters(query, accessibleChildrenIds);

      // Ejecutar query
      const { data, error } = await query;
      if (error) throw error;

      // Transformar datos
      const newLogs = transformLogsData(data);

      // Actualizar estado
      updateLogsState(newLogs, append);

    } catch (err) {
      handleFetchError(err);
    } finally {
      if (mountedRef.current && !append) {
        setLoading(false);
      }
    }
  }, [
    userId,
    getAccessibleChildrenIds,
    handleNoAccessibleChildren,
    buildBaseQuery,
    applyQueryFilters,
    transformLogsData,
    updateLogsState,
    handleFetchError
  ]);

  // ================================================================
  // FUNCIONES DE FETCH STATS
  // ================================================================

  const fetchStats = useCallback(async (): Promise<void> => {
    if (!userId) return;

    try {
      console.log('📈 Fetching dashboard stats...');
      
      const accessibleChildrenIds = await getAccessibleChildrenIds();
      if (accessibleChildrenIds.length === 0) {
        return;
      }

      // Obtener estadísticas básicas
      const [
        { count: totalLogs },
        { count: logsThisWeek },
        { count: logsThisMonth },
        { count: pendingReviews },
        { count: followUpsDue },
        { count: activeCategories }
      ] = await Promise.all([
        supabase.from('daily_logs').select('*', { count: 'exact', head: true }).in('child_id', accessibleChildrenIds).eq('is_deleted', false),
        supabase.from('daily_logs').select('*', { count: 'exact', head: true }).in('child_id', accessibleChildrenIds).eq('is_deleted', false).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('daily_logs').select('*', { count: 'exact', head: true }).in('child_id', accessibleChildrenIds).eq('is_deleted', false).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('daily_logs').select('*', { count: 'exact', head: true }).in('child_id', accessibleChildrenIds).eq('is_deleted', false).is('reviewed_by', null),
        supabase.from('daily_logs').select('*', { count: 'exact', head: true }).in('child_id', accessibleChildrenIds).eq('is_deleted', false).eq('follow_up_required', true).not('follow_up_date', 'is', null).lte('follow_up_date', new Date().toISOString()),
        supabase.from('categories').select('*', { count: 'exact', head: true }).eq('is_active', true)
      ]);

      const newStats: DashboardStats = {
        total_children: accessibleChildrenIds.length,
        total_logs: totalLogs ?? 0,
        logs_this_week: logsThisWeek ?? 0,
        logs_this_month: logsThisMonth ?? 0,
        active_categories: activeCategories ?? 0,
        pending_reviews: pendingReviews ?? 0,
        follow_ups_due: followUpsDue ?? 0
      };

      if (mountedRef.current) {
        setStats(newStats);
        console.log('✅ Stats fetched successfully:', newStats);
      }

    } catch (err) {
      console.error('❌ Error fetching stats:', err);
    }
  }, [userId, getAccessibleChildrenIds, supabase]);

  // ================================================================
  // FUNCIONES PRINCIPALES DEL HOOK
  // ================================================================

  const refreshLogs = useCallback(async (): Promise<void> => {
    setCurrentPage(0);
    await Promise.all([
      fetchLogs(0, false),
      fetchStats()
    ]);
  }, [fetchLogs, fetchStats]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (!hasMore || loading) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchLogs(nextPage, true);
  }, [hasMore, loading, currentPage, fetchLogs]);

  const createLog = useCallback(async (logData: LogInsert): Promise<DailyLog> => {
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const canAccess = await userCanAccessChild(logData.child_id, userId);
      if (!canAccess) {
        throw new Error('No tienes permisos para crear registros para este niño');
      }

      const { data, error } = await supabase
        .from('daily_logs')
        .insert({
          ...logData,
          logged_by: userId
        })
        .select()
        .single();

      if (error) throw error;

      await refreshLogs();
      
      await auditSensitiveAccess(
        'CREATE_LOG',
        data.id,
        `Created log: ${data.title}`
      );

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear registro';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase, refreshLogs]);

  const updateLog = useCallback(async (id: string, updates: LogUpdate): Promise<DailyLog> => {
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('daily_logs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await refreshLogs();
      
      await auditSensitiveAccess(
        'UPDATE_LOG',
        id,
        `Updated log: ${data.title}`
      );

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar registro';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase, refreshLogs]);

  const deleteLog = useCallback(async (id: string): Promise<void> => {
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      // Soft delete
      const { error } = await supabase
        .from('daily_logs')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await refreshLogs();
      
      await auditSensitiveAccess(
        'DELETE_LOG',
        id,
        'Deleted log (soft delete)'
      );

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar registro';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase, refreshLogs]);

  const markAsReviewed = useCallback(async (id: string, specialistNotes?: string): Promise<void> => {
    await updateLog(id, {
      reviewed_at: new Date().toISOString(),
      specialist_notes: specialistNotes
    } as any);
  }, [updateLog]);

  const addParentFeedback = useCallback(async (id: string, feedback: string): Promise<void> => {
    await updateLog(id, {
      parent_feedback: feedback
    });
  }, [updateLog]);

  const togglePrivacy = useCallback(async (id: string): Promise<void> => {
    const log = logs.find(l => l.id === id);
    if (!log) throw new Error('Registro no encontrado');
    
    await updateLog(id, {
      is_private: !log.is_private
    });
  }, [logs, updateLog]);

  const getLogById = useCallback((id: string): LogWithDetails | undefined => {
    return logs.find(log => log.id === id);
  }, [logs]);

  const filterLogs = useCallback((filters: LogFilters): LogWithDetails[] => {
    return logs.filter(log => {
      if (filters.child_id && log.child_id !== filters.child_id) return false;
      if (filters.category_id && log.category_id !== filters.category_id) return false;
      if (filters.search_term) {
        const searchLower = filters.search_term.toLowerCase();
        if (!log.title.toLowerCase().includes(searchLower) && 
            !log.content.toLowerCase().includes(searchLower)) return false;
      }
      return true;
    });
  }, [logs]);

  const canEditLog = useCallback(async (logId: string): Promise<boolean> => {
    const log = logs.find(l => l.id === logId);
    if (!log) return false;
    
    return await userCanEditChild(log.child_id, userId);
  }, [logs, userId]);

  const exportLogs = useCallback(async (format: 'csv' | 'pdf'): Promise<void> => {
    throw new Error(`Exportación en formato ${format} no implementada aún`);
  }, []);

  // ================================================================
  // EFFECTS CORREGIDOS - SIN LOOPS INFINITOS
  // ================================================================

  //  EFECTO INICIAL - SOLO EJECUTAR CUANDO CAMBIE userId O LAS OPCIONES
  useEffect(() => {
    if (!userId) {
      setLogs([]);
      setStats({
        total_children: 0,
        total_logs: 0,
        logs_this_week: 0,
        logs_this_month: 0,
        active_categories: 0,
        pending_reviews: 0,
        follow_ups_due: 0
      });
      setLoading(false);
      return;
    }

    // Actualizar referencia de opciones
    lastOptionsRef.current = options;

    // Fetch inicial
    const initializeLogs = async () => {
      await Promise.all([
        fetchLogs(0, false),
        fetchStats()
      ]);
    };

    initializeLogs();
  }, [userId, optionsChanged, fetchLogs, fetchStats]); // Solo dependencias estables

  // EFECTO REALTIME - GESTIÓN CORRECTA DE SUSCRIPCIONES
  useEffect(() => {
    if (!realtime || !userId) return;

    // Limpiar canal anterior si existe
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    // Crear nuevo canal con ID único
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_logs'
        },
        (payload) => {
          console.log('🔄 Realtime update received:', payload);
          
          // Solo refrescar si el componente sigue montado
          if (mountedRef.current && autoRefresh) {
            // Debounce the refresh to avoid too many calls
            setTimeout(() => {
              if (mountedRef.current) {
                refreshLogs();
              }
            }, 500);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup function
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [realtime, userId, channelId, autoRefresh, refreshLogs, supabase]);

  //  CLEANUP EFFECT
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      
      // Limpiar canal realtime
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, []);

  // ================================================================
  // RETURN DEL HOOK
  // ================================================================

  return {
    logs,
    stats,
    loading,
    error,
    hasMore,
    createLog,
    updateLog,
    deleteLog,
    markAsReviewed,
    addParentFeedback,
    togglePrivacy,
    loadMore,
    refreshLogs,
    filterLogs,
    exportLogs,
    getLogById,
    canEditLog
  };
}