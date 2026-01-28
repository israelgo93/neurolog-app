// ================================================================
// src/types/index.ts - TIPOS ACTUALIZADOS PARA NUEVA BD
// ================================================================

// TIPOS BASE Y ENUMS
export type UserRole = 'parent' | 'teacher' | 'specialist' | 'admin';
export type RelationshipType = 'parent' | 'teacher' | 'specialist' | 'observer' | 'family';
export type IntensityLevel = 'low' | 'medium' | 'high';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type AuditOperation = 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT';

// ================================================================
// PROFILE TYPES
// ================================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
  phone?: string | null;
  is_active: boolean;
  last_login?: string | null;
  failed_login_attempts: number;
  last_failed_login?: string | null;
  account_locked_until?: string | null;
  timezone: string;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  email: string;
  full_name: string;
  role?: UserRole;
  avatar_url?: string | null;
  phone?: string | null;
  timezone?: string;
  preferences?: Record<string, any>;
}

export interface ProfileUpdate {
  full_name?: string;
  avatar_url?: string | null;
  phone?: string | null;
  timezone?: string;
  preferences?: Record<string, any>;
}

// ================================================================
// CHILD TYPES
// ================================================================

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  is_primary?: boolean;
}

export interface MedicalInfo {
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  emergency_notes?: string;
}

export interface EducationalInfo {
  school?: string;
  grade?: string;
  teacher?: string;
  iep_goals?: string[];
  accommodations?: string[];
}

export interface PrivacySettings {
  share_with_specialists: boolean;
  share_progress_reports: boolean;
  allow_photo_sharing?: boolean;
  data_retention_months?: number;
}

export interface Child {
  id: string;
  name: string;
  birth_date?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
  is_active: boolean;
  avatar_url?: string | null;
  emergency_contact: EmergencyContact[];
  medical_info: MedicalInfo;
  educational_info: EducationalInfo;
  privacy_settings: PrivacySettings;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ChildInsert {
  name: string;
  birth_date?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
  avatar_url?: string | null;
  emergency_contact?: EmergencyContact[];
  medical_info?: MedicalInfo;
  educational_info?: EducationalInfo;
  privacy_settings?: PrivacySettings;
}

export interface ChildUpdate {
  name?: string;
  birth_date?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
  avatar_url?: string | null;
  emergency_contact?: EmergencyContact[];
  medical_info?: MedicalInfo;
  educational_info?: EducationalInfo;
  privacy_settings?: PrivacySettings;
  is_active?: boolean;
}

// ================================================================
// RELATION TYPES
// ================================================================

export interface UserChildRelation {
  id: string;
  user_id: string;
  child_id: string;
  relationship_type: RelationshipType;
  can_edit: boolean;
  can_view: boolean;
  can_export: boolean;
  can_invite_others: boolean;
  granted_by: string;
  granted_at: string;
  expires_at?: string | null;
  is_active: boolean;
  notes?: string | null;
  notification_preferences: Record<string, any>;
  created_at: string;
}

export interface RelationInsert {
  user_id: string;
  child_id: string;
  relationship_type: RelationshipType;
  can_edit?: boolean;
  can_view?: boolean;
  can_export?: boolean;
  can_invite_others?: boolean;
  granted_by: string;
  expires_at?: string | null;
  notes?: string | null;
  notification_preferences?: Record<string, any>;
}

// Tipo combinado para niños con información de relación
export interface ChildWithRelation extends Child {
  user_id: string;
  relationship_type: RelationshipType;
  can_view: boolean;
  can_edit: boolean;
  can_export: boolean;
  can_invite_others: boolean;
  granted_at: string;
  expires_at?: string | null;
  is_relation_active: boolean;
  relation_created_at: string;
  relation_expires_at?: string | null;
  creator_name: string;
}

// ================================================================
// CATEGORY TYPES
// ================================================================

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
  created_by?: string | null;
  created_at: string;
}

export interface CategoryInsert {
  name: string;
  description?: string | null;
  color?: string;
  icon?: string;
  sort_order?: number;
}

// ================================================================
// DAILY LOG TYPES
// ================================================================

export interface DailyLog {
  id: string;
  child_id: string;
  category_id?: string | null;
  title: string;
  content: string;
  mood_score?: number | null;
  intensity_level: IntensityLevel;
  logged_by: string;
  log_date: string;
  is_private: boolean;
  is_deleted: boolean;
  is_flagged: boolean;
  attachments: any[];
  tags: string[];
  location?: string | null;
  weather?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  specialist_notes?: string | null;
  parent_feedback?: string | null;
  follow_up_required: boolean;
  follow_up_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LogInsert {
  child_id: string;
  category_id?: string | null;
  title: string;
  content: string;
  mood_score?: number | null;
  intensity_level?: IntensityLevel;
  log_date?: string;
  is_private?: boolean;
  attachments?: any[];
  tags?: string[];
  location?: string | null;
  weather?: string | null;
  follow_up_required?: boolean;
  follow_up_date?: string | null;
}

export interface LogUpdate {
  category_id?: string | null;
  title?: string;
  content?: string;
  mood_score?: number | null;
  intensity_level?: IntensityLevel;
  log_date?: string;
  is_private?: boolean;
  attachments?: any[];
  tags?: string[];
  location?: string | null;
  weather?: string | null;
  specialist_notes?: string | null;
  parent_feedback?: string | null;
  follow_up_required?: boolean;
  follow_up_date?: string | null;
  needs_review?: boolean;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
}

// Tipo combinado para logs con información detallada
export interface LogWithDetails extends DailyLog {
  child: {
    id: string;
    name: string;
    avatar_url?: string | null;
  };
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  } | null;
  logged_by_profile: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  };
}

// ================================================================
// FILTER TYPES
// ================================================================

export interface LogFilters {
  child_id?: string;
  category_id?: string;
  date_from?: string;
  date_to?: string;
  mood_score_min?: number;
  mood_score_max?: number;
  intensity_level?: IntensityLevel;
  is_private?: boolean;
  has_attachments?: boolean;
  tags?: string[];
  search_term?: string;
  logged_by?: string;
  reviewed_status?: 'all' | 'reviewed' | 'pending';
  follow_up_status?: 'all' | 'required' | 'completed';
}

export interface ChildFilters {
  search?: string;
  relationship_type?: RelationshipType;
  is_active?: boolean;
  age_min?: number;
  age_max?: number;
  has_diagnosis?: boolean;
  max_age?: number;
}

// ================================================================
// DASHBOARD STATS TYPES
// ================================================================

export interface DashboardStats {
  total_children: number;
  total_logs: number;
  logs_this_week: number;
  logs_this_month: number;
  active_categories: number;
  pending_reviews: number;
  follow_ups_due: number;
}

// ================================================================
// API RESPONSE TYPES
// ================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: 'success' | 'error' | 'loading';
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ================================================================
// EXPORT TYPES
// ================================================================

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'json';
  date_range: {
    from: string;
    to: string;
  };
  include_private: boolean;
  include_attachments: boolean;
  child_ids: string[];
  category_ids: string[];
  fields: string[];
}

// ================================================================
// FORM VALIDATION TYPES
// ================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

// ================================================================
// REALTIME TYPES
// ================================================================

export interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  schema: string;
  table: string;
  commit_timestamp: string;
}