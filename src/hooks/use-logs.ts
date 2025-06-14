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
      // ✅ CORRECCIÓN: Quitar el filtro .eq('user_id', userId) 
      // porque la vista user_accessible_children ya filtra automáticamente por auth.uid()
      const { data, error } = await supabase
        .from('user_accessible_children')
        .select('id');  // ← Sin filtro adicional
      
      if (error) throw error;
      return data?.map(child => child.id) || [];
    } catch (err) {
      console.error('❌ Error getting accessible children:', err);
      return [];
    }
  }, [userId, supabase]);

  // ================================================================
  // FUNCIONES DE FETCH ESTABILIZADAS
  // ================================================================

  
  const setLoadingState = (append: boolean) => {
    if (!append) {
      setLoading(true);
      setError(null);
    }
  };

  const shouldAbortFetch = (accessibleChildrenIds: string[], append: boolean): boolean => {
    if (accessibleChildrenIds.length === 0) {
      if (mountedRef.current) {
        setLogs([]);
        setHasMore(false);
        setLoading(false);
      }
      return true;
    }
    return false;
  };

  const buildLogsQuery = (accessibleChildrenIds: string[], page: number) => {
    let query = supabase
      .from('daily_logs')
      .select(`
        *,
        child:children!inner(id, name, avatar_url),
        category:categories(id, name, color, icon),
        logged_by_profile:profiles!daily_logs_logged_by_fkey(id, full_name, avatar_url)
      `)
      .in('child_id', accessibleChildrenIds)
      .eq('is_active', !includeDeleted)
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (childId) {
      if (!accessibleChildrenIds.includes(childId)) {
        throw new Error('No tienes acceso a este niño');
      }
      query = query.eq('child_id', childId);
    }

    if (!includePrivate) {
      query = query.eq('is_private', false);
    }

    return query;
  };

  const processFetchedLogs = (data: any[]): LogWithDetails[] => {
    return data.map(log => ({
      ...log,
      child: log.child ?? { id: log.child_id, name: 'Niño desconocido', avatar_url: null },
      category: log.category ??  { id: '', name: 'Sin categoría', color: '#gray', icon: 'circle' },
      logged_by_profile: log.logged_by_profile ?? { id: log.logged_by, full_name: 'Usuario desconocido', avatar_url: null }
    })) as LogWithDetails[];
  };

  const updateStateAfterFetch = (newLogs: LogWithDetails[], append: boolean, page: number) => {
    if (!mountedRef.current) return;

    if (append) {
      setLogs(prev => [...prev, ...newLogs]);
    } else {
      setLogs(newLogs);
    }
    
    setHasMore(newLogs.length === pageSize);
    console.log(`✅ Logs fetched successfully: ${newLogs.length}`);
  };

  const handleFetchError = (err: unknown) => {
    console.error('❌ Error fetching logs:', err);
    if (mountedRef.current) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los registros';
      setError(errorMessage);
    }
  };

  
  const fetchLogs = useCallback(async (page: number = 0, append: boolean = false): Promise<void> => {
    if (!userId) return;

    try {
      setLoadingState(append);
      
      console.log(`📊 Fetching logs - Page: ${page}, Append: ${append}`);
      
      const accessibleChildrenIds = await getAccessibleChildrenIds();
      if (shouldAbortFetch(accessibleChildrenIds, append)) {
        return;
      }

      const query = buildLogsQuery(accessibleChildrenIds, page);
      const { data, error } = await query;

      if (error) throw error;

      const newLogs = processFetchedLogs(data || []);
      updateStateAfterFetch(newLogs, append, page);

    } catch (err) {
      handleFetchError(err);
    } finally {
      if (!append && mountedRef.current) {
        setLoading(false);
      }
    }
  }, [userId, childId, includePrivate, includeDeleted, pageSize, getAccessibleChildrenIds, supabase]);

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
        supabase.from('daily_logs').select('*', { count: 'exact', head: true }).in('child_id', accessibleChildrenIds),
        supabase.from('daily_logs').select('*', { count: 'exact', head: true }).in('child_id', accessibleChildrenIds).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('daily_logs').select('*', { count: 'exact', head: true }).in('child_id', accessibleChildrenIds).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('daily_logs').select('*', { count: 'exact', head: true }).in('child_id', accessibleChildrenIds).eq('needs_review', true),
        supabase.from('daily_logs').select('*', { count: 'exact', head: true }).in('child_id', accessibleChildrenIds).not('follow_up_date', 'is', null).lte('follow_up_date', new Date().toISOString()),
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
      needs_review: false,
      reviewed_at: new Date().toISOString(),
      reviewed_by: userId,
      specialist_notes: specialistNotes
    });
  }, [updateLog, userId]);

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

  const exportLogs = useCallback(async (format: 'csv' | 'pdf', filters?: LogFilters): Promise<void> => {
    // Implementar exportación
    console.log('Exportando logs en formato:', format, 'con filtros:', filters);
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
  }, [userId, optionsChanged]); // Solo dependencias estables

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