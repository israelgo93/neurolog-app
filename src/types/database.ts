// src/types/database.ts
// Tipos básicos de Database para Supabase
// NOTA: Este es un archivo placeholder. Para obtener los tipos completos ejecuta:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
type RoleType = 'parent' | 'teacher' | 'specialist' | 'admin';
type IntensityLevel = 'low' | 'medium' | 'high';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: RoleType
          avatar_url?: string
          phone?: string
          is_active: boolean
          last_login?: string
          failed_login_attempts: number
          last_failed_login?: string
          account_locked_until?: string
          timezone: string
          preferences: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: RoleType
          avatar_url?: string
          phone?: string
          is_active?: boolean
          last_login?: string
          failed_login_attempts?: number
          last_failed_login?: string
          account_locked_until?: string
          timezone?: string
          preferences?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: RoleType
          avatar_url?: string
          phone?: string
          is_active?: boolean
          last_login?: string
          failed_login_attempts?: number
          last_failed_login?: string
          account_locked_until?: string
          timezone?: string
          preferences?: any
          created_at?: string
          updated_at?: string
        }
      }
      children: {
        Row: {
          id: string
          name: string
          birth_date?: string
          diagnosis?: string
          notes?: string
          is_active: boolean
          avatar_url?: string
          emergency_contact: any
          medical_info: any
          educational_info: any
          privacy_settings: any
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          birth_date?: string
          diagnosis?: string
          notes?: string
          is_active?: boolean
          avatar_url?: string
          emergency_contact?: any
          medical_info?: any
          educational_info?: any
          privacy_settings?: any
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          birth_date?: string
          diagnosis?: string
          notes?: string
          is_active?: boolean
          avatar_url?: string
          emergency_contact?: any
          medical_info?: any
          educational_info?: any
          privacy_settings?: any
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description?: string
          color: string
          icon: string
          is_active: boolean
          sort_order: number
          created_by?: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          color?: string
          icon?: string
          is_active?: boolean
          sort_order?: number
          created_by?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          color?: string
          icon?: string
          is_active?: boolean
          sort_order?: number
          created_by?: string
          created_at?: string
        }
      }
      daily_logs: {
        Row: {
          id: string
          child_id: string
          category_id?: string
          title: string
          content: string
          mood_score?: number
          intensity_level: IntensityLevel 
          logged_by: string
          log_date: string
          is_private: boolean
          is_deleted: boolean
          is_flagged: boolean
          attachments: any
          tags: string[]
          location?: string
          weather?: string
          reviewed_by?: string
          reviewed_at?: string
          specialist_notes?: string
          parent_feedback?: string
          follow_up_required: boolean
          follow_up_date?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          category_id?: string
          title: string
          content: string
          mood_score?: number
          intensity_level?: IntensityLevel
          logged_by: string
          log_date?: string
          is_private?: boolean
          is_deleted?: boolean
          is_flagged?: boolean
          attachments?: any
          tags?: string[]
          location?: string
          weather?: string
          reviewed_by?: string
          reviewed_at?: string
          specialist_notes?: string
          parent_feedback?: string
          follow_up_required?: boolean
          follow_up_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          category_id?: string
          title?: string
          content?: string
          mood_score?: number
          intensity_level?: 'low' | 'medium' | 'high'
          logged_by?: string
          log_date?: string
          is_private?: boolean
          is_deleted?: boolean
          is_flagged?: boolean
          attachments?: any
          tags?: string[]
          location?: string
          weather?: string
          reviewed_by?: string
          reviewed_at?: string
          specialist_notes?: string
          parent_feedback?: string
          follow_up_required?: boolean
          follow_up_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_can_access_child: {
        Args: {
          child_id: string
          user_id?: string
        }
        Returns: boolean
      }
      user_can_edit_child: {
        Args: {
          child_id: string
          user_id?: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      audit_sensitive_access: {
        Args: {
          action_type: string
          resource_id: string
          action_details?: string
        }
        Returns: void
      }
      handle_failed_login: {
        Args: {
          user_email: string
        }
        Returns: void
      }
    }
    Enums: {
      user_role: 'parent' | 'teacher' | 'specialist' | 'admin'
      relationship_type: 'parent' | 'teacher' | 'specialist' | 'observer' | 'family'
      intensity_level: 'low' | 'medium' | 'high'
      audit_operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT'
      risk_level: 'low' | 'medium' | 'high' | 'critical'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}