// src/lib/supabase-server.ts
// Configuración de Supabase específica para Server Components

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// ================================================================
// CONFIGURACIÓN DE ENVIRONMENT
// ================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// ================================================================
// CLIENTE PARA SERVER COMPONENTS
// ================================================================

export async function createServerComponentClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            console.error('Error al establecer cookies:', error);

          }
        },
      },
    }
  )
}

// ================================================================
// CLIENTE PARA ROUTE HANDLERS
// ================================================================

export async function createRouteHandlerClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}

// ================================================================
// FUNCIONES HELPER PARA SERVER COMPONENTS
// ================================================================

/**
 * Obtiene la sesión del usuario en Server Components
 */
export async function getServerSession() {
  const supabase = await createServerComponentClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error getting server session:', error)
    return null
  }
}

/**
 * Obtiene el usuario actual en Server Components
 */
export async function getServerUser() {
  const supabase = await createServerComponentClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting server user:', error)
    return null
  }
}

/**
 * Verifica si el usuario está autenticado en Server Components
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession()
  return !!session
}

// ================================================================
// TIPOS DE DATABASE
// ================================================================

export type { Database } from '@/types/database'