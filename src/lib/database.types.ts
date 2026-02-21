// src/lib/database.types.ts
// Tipos generados automáticamente desde Supabase CLI
// Actualizados para el nuevo schema de NeuroLog
type Operation = 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT';
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
type RelationshipType = 'parent' | 'teacher' | 'specialist' | 'observer' | 'family';
type RoleType = 'parent' | 'teacher' | 'specialist' | 'admin';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string
          table_name: string
          operation: Operation
          record_id: string | null
          user_id: string | null
          user_role: string | null
          old_values: Json | null
          new_values: Json | null
          changed_fields: string[] | null
          ip_address: string | null
          user_agent: string | null
          session_id: string | null
          risk_level: RiskLevel
          created_at: string
        }
        Insert: {
          id?: string
          table_name: string
          operation: Operation
          record_id?: string | null
          user_id?: string | null
          user_role?: string | null
          old_values?: Json | null
          new_values?: Json | null
          changed_fields?: string[] | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          risk_level?: RiskLevel
          created_at?: string
        }
        Update: {
          id?: string
          table_name?: string
          operation?: Operation
          record_id?: string | null
          user_id?: string | null
          user_role?: string | null
          old_values?: Json | null
          new_values?: Json | null
          changed_fields?: string[] | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          risk_level?: RiskLevel
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          icon: string
          is_active: boolean
          sort_order: number
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          icon?: string
          is_active?: boolean
          sort_order?: number
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          icon?: string
          is_active?: boolean
          sort_order?: number
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      children: {
        Row: {
          id: string
          name: string
          birth_date: string | null
          diagnosis: string | null
          notes: string | null
          is_active: boolean
          avatar_url: string | null
          emergency_contact: Json
          medical_info: Json
          educational_info: Json
          privacy_settings: Json
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          birth_date?: string | null
          diagnosis?: string | null
          notes?: string | null
          is_active?: boolean
          avatar_url?: string | null
          emergency_contact?: Json
          medical_info?: Json
          educational_info?: Json
          privacy_settings?: Json
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          birth_date?: string | null
          diagnosis?: string | null
          notes?: string | null
          is_active?: boolean
          avatar_url?: string | null
          emergency_contact?: Json
          medical_info?: Json
          educational_info?: Json
          privacy_settings?: Json
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      daily_logs: {
        Row: {
          id: string
          child_id: string
          category_id: string | null
          title: string
          content: string
          mood_score: number | null
          intensity_level: RiskLevel
          logged_by: string
          log_date: string
          is_private: boolean
          is_deleted: boolean
          is_flagged: boolean
          attachments: Json
          tags: string[]
          location: string | null
          weather: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          specialist_notes: string | null
          parent_feedback: string | null
          follow_up_required: boolean
          follow_up_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          category_id?: string | null
          title: string
          content: string
          mood_score?: number | null
          intensity_level?: 'low' | 'medium' | 'high'
          logged_by: string
          log_date?: string
          is_private?: boolean
          is_deleted?: boolean
          is_flagged?: boolean
          attachments?: Json
          tags?: string[]
          location?: string | null
          weather?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          specialist_notes?: string | null
          parent_feedback?: string | null
          follow_up_required?: boolean
          follow_up_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          category_id?: string | null
          title?: string
          content?: string
          mood_score?: number | null
          intensity_level?: 'low' | 'medium' | 'high'
          logged_by?: string
          log_date?: string
          is_private?: boolean
          is_deleted?: boolean
          is_flagged?: boolean
          attachments?: Json
          tags?: string[]
          location?: string | null
          weather?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          specialist_notes?: string | null
          parent_feedback?: string | null
          follow_up_required?: boolean
          follow_up_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_logs_child_id_fkey"
            columns: ["child_id"]
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_logs_logged_by_fkey"
            columns: ["logged_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_logs_reviewed_by_fkey"
            columns: ["reviewed_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: RoleType | null
          avatar_url: string | null
          phone: string | null
          is_active: boolean
          last_login: string | null
          failed_login_attempts: number
          last_failed_login: string | null
          account_locked_until: string | null
          timezone: string
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: RoleType | null
          avatar_url?: string | null
          phone?: string | null
          is_active?: boolean
          last_login?: string | null
          failed_login_attempts?: number
          last_failed_login?: string | null
          account_locked_until?: string | null
          timezone?: string
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: RoleType | null
          avatar_url?: string | null
          phone?: string | null
          is_active?: boolean
          last_login?: string | null
          failed_login_attempts?: number
          last_failed_login?: string | null
          account_locked_until?: string | null
          timezone?: string
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_child_relations: {
        Row: {
          id: string
          user_id: string
          child_id: string
          relationship_type: RelationshipType
          can_edit: boolean
          can_view: boolean
          can_export: boolean
          can_invite_others: boolean
          granted_by: string
          granted_at: string
          expires_at: string | null
          is_active: boolean
          notes: string | null
          notification_preferences: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          child_id: string
          relationship_type: RelationshipType
          can_edit?: boolean
          can_view?: boolean
          can_export?: boolean
          can_invite_others?: boolean
          granted_by: string
          granted_at?: string
          expires_at?: string | null
          is_active?: boolean
          notes?: string | null
          notification_preferences?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          child_id?: string
          relationship_type?: RelationshipType
          can_edit?: boolean
          can_view?: boolean
          can_export?: boolean
          can_invite_others?: boolean
          granted_by?: string
          granted_at?: string
          expires_at?: string | null
          is_active?: boolean
          notes?: string | null
          notification_preferences?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_child_relations_child_id_fkey"
            columns: ["child_id"]
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_child_relations_granted_by_fkey"
            columns: ["granted_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_child_relations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      child_log_statistics: {
        Row: {
          child_id: string | null
          child_name: string | null
          total_logs: number | null
          logs_this_week: number | null
          logs_this_month: number | null
          avg_mood_score: number | null
          last_log_date: string | null
          categories_used: number | null
          private_logs: number | null
          reviewed_logs: number | null
        }
        Relationships: [
          {
            foreignKeyName: "children_created_by_fkey"
            columns: ["child_id"]
            referencedRelation: "children"
            referencedColumns: ["id"]
          }
        ]
      }
      user_accessible_children: {
        Row: {
          id: string | null
          name: string | null
          birth_date: string | null
          diagnosis: string | null
          notes: string | null
          is_active: boolean | null
          avatar_url: string | null
          emergency_contact: Json | null
          medical_info: Json | null
          educational_info: Json | null
          privacy_settings: Json | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
          relationship_type: RelationshipType | null
          can_edit: boolean | null
          can_view: boolean | null
          can_export: boolean | null
          can_invite_others: boolean | null
          granted_at: string | null
          expires_at: string | null
          creator_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Functions: {
      audit_sensitive_access: {
        Args: {
          table_name: string
          record_id: string
          operation?: string
        }
        Returns: undefined
      }
      handle_new_child_secure: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      handle_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin: {
        Args: {
          user_id?: string
        }
        Returns: boolean
      }
      user_can_access_child: {
        Args: {
          child_uuid: string
        }
        Returns: boolean
      }
      user_can_edit_child: {
        Args: {
          child_uuid: string
        }
        Returns: boolean
      }
      verify_installation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}