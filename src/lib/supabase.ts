// src/lib/supabase.ts
// Configuración de Supabase separada para Client y Server Components

import { createBrowserClient } from '@supabase/ssr'

// ================================================================
// CONFIGURACIÓN DE ENVIRONMENT
// ================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// ================================================================
// CLIENTE PARA COMPONENTES DEL CLIENTE (Browser)
// ================================================================

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// ================================================================
// FUNCIONES HELPER DE AUTENTICACIÓN
// ================================================================

/**
 * Verifica si el usuario puede acceder a un niño específico
 */
export async function userCanAccessChild(childId: string, userId?: string): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { data } = await supabase.rpc('user_can_access_child', {
      child_id: childId,
      user_id: userId
    })
    
    return data === true
  } catch (error) {
    console.error('Error checking child access:', error)
    return false
  }
}

/**
 * Verifica si el usuario puede editar un niño específico
 */
export async function userCanEditChild(childId: string, userId?: string): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { data } = await supabase.rpc('user_can_edit_child', {
      child_id: childId,
      user_id: userId
    })
    
    return data === true
  } catch (error) {
    console.error('Error checking child edit permissions:', error)
    return false
  }
}

/**
 * Registra acceso sensible para auditoría
 */
export async function auditSensitiveAccess(
  action: string,
  resourceId: string,
  details?: string
): Promise<void> {
  const supabase = createClient()
  
  try {
    await supabase.rpc('audit_sensitive_access', {
      action_type: action,
      resource_id: resourceId,
      action_details: details
    })
  } catch (error) {
    console.error('Error logging sensitive access:', error)
    // No fallar por errores de auditoría
  }
}

// ================================================================
// MANEJO DE ERRORES
// ================================================================

export interface SupabaseError {
  message: string
  details?: string
  hint?: string
  code?: string
}

export function handleSupabaseError(error: any): SupabaseError {
  if (error?.message) {
    return {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    }
  }
  
  return {
    message: 'Ha ocurrido un error inesperado',
    details: String(error)
  }
}

export function isAuthError(error: any): boolean {
  return error?.message?.includes('Invalid login credentials') ??
         error?.message?.includes('Email not confirmed') ??
         error?.message?.includes('User not found')
}

// ================================================================
// STORAGE HELPERS
// ================================================================

export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  ATTACHMENTS: 'attachments',
  DOCUMENTS: 'documents'
} as const

/**
 * Sube un archivo al storage de Supabase
 */
export async function uploadFile(
  bucket: keyof typeof STORAGE_BUCKETS,
  file: File,
  path?: string
): Promise<{ url: string; path: string }> {
  const supabase = createClient()
  const fileName = path ?? `${Date.now()}-${file.name}`
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .upload(fileName, file)
  
  if (error) {
    throw new Error(`Error uploading file: ${error.message}`)
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .getPublicUrl(data.path)
  
  return {
    url: publicUrl,
    path: data.path
  }
}

/**
 * Obtiene URL pública de un archivo
 */
export function getPublicUrl(bucket: keyof typeof STORAGE_BUCKETS, path: string): string {
  const supabase = createClient()
  
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .getPublicUrl(path)
  
  return data.publicUrl
}

/**
 * Elimina un archivo del storage
 */
export async function deleteFile(
  bucket: keyof typeof STORAGE_BUCKETS,
  path: string
): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .remove([path])
  
  if (error) {
    throw new Error(`Error deleting file: ${error.message}`)
  }
}

// ================================================================
// UTILIDADES DE REALTIME
// ================================================================

/**
 * Suscribirse a cambios en tiempo real de una tabla
 */
export function subscribeToTable(
  table: string,
  callback: (payload: any) => void,
  filter?: string
) {
  const supabase = createClient()
  
  let channel = supabase
    .channel(`public:${table}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: table,
      filter: filter
    }, callback)
  
  channel.subscribe()
  
  return () => {
    channel.unsubscribe()
  }
}