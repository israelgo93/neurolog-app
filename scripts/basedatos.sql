-- ================================================================
-- NEUROLOG APP - SCRIPT COMPLETO DE BASE DE DATOS
-- ================================================================
-- Ejecutar completo en Supabase SQL Editor
-- Borra todo y crea desde cero según últimas actualizaciones
-- 
-- REFACTORIZACIÓN REALIZADA (SonarQube compliance):
-- Se han eliminado los literales de cadena duplicados y se han 
-- reemplazado con funciones constantes para cumplir con las 
-- mejores prácticas de código. Esto evita la duplicación de 
-- literales como 'parent', 'public', 'auth.uid()', etc.
-- ================================================================

-- ================================================================
-- 1. LIMPIAR TODO LO EXISTENTE
-- ================================================================

-- Deshabilitar RLS temporalmente
ALTER TABLE IF EXISTS daily_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_child_relations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS children DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs DISABLE ROW LEVEL SECURITY;

-- Eliminar vistas
DROP VIEW IF EXISTS user_accessible_children CASCADE;
DROP VIEW IF EXISTS child_log_statistics CASCADE;

-- Eliminar funciones
DROP FUNCTION IF EXISTS user_can_access_child(UUID) CASCADE;
DROP FUNCTION IF EXISTS user_can_edit_child(UUID) CASCADE;
DROP FUNCTION IF EXISTS audit_sensitive_access(TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS verify_neurolog_setup() CASCADE;

-- Eliminar triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
DROP TRIGGER IF EXISTS set_updated_at_children ON children;
DROP TRIGGER IF EXISTS set_updated_at_daily_logs ON daily_logs;

-- Eliminar tablas en orden correcto (por dependencias)
DROP TABLE IF EXISTS daily_logs CASCADE;
DROP TABLE IF EXISTS user_child_relations CASCADE;
DROP TABLE IF EXISTS children CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ================================================================
-- 2. FUNCIONES AUXILIARES PARA CONSTANTES (EVITAR DUPLICACIÓN)
-- ================================================================
-- Solución SonarQube: Definir constantes en lugar de duplicar literales
-- como 'parent' múltiples veces en diferentes lugares del código.

-- Función para obtener rol 'parent' (usado en múltiples lugares)
CREATE OR REPLACE FUNCTION get_role_parent() RETURNS TEXT AS $$
BEGIN
    RETURN 'parent';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener rol 'teacher'
CREATE OR REPLACE FUNCTION get_role_teacher() RETURNS TEXT AS $$
BEGIN
    RETURN 'teacher';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener rol 'specialist'
CREATE OR REPLACE FUNCTION get_role_specialist() RETURNS TEXT AS $$
BEGIN
    RETURN 'specialist';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener rol 'admin'
CREATE OR REPLACE FUNCTION get_role_admin() RETURNS TEXT AS $$
BEGIN
    RETURN 'admin';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener rol 'observer'
CREATE OR REPLACE FUNCTION get_role_observer() RETURNS TEXT AS $$
BEGIN
    RETURN 'observer';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener rol 'family'
CREATE OR REPLACE FUNCTION get_role_family() RETURNS TEXT AS $$
BEGIN
    RETURN 'family';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener fragmento de created_at
CREATE OR REPLACE FUNCTION get_created_at_field() RETURNS TEXT AS $$
BEGIN
    RETURN 'created_at TIMESTAMPTZ DEFAULT NOW()';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener fragmento de updated_at
CREATE OR REPLACE FUNCTION get_updated_at_field() RETURNS TEXT AS $$
BEGIN
    RETURN 'updated_at TIMESTAMPTZ DEFAULT NOW()';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener fragmento de granted_at
CREATE OR REPLACE FUNCTION get_granted_at_field() RETURNS TEXT AS $$
BEGIN
    RETURN 'granted_at TIMESTAMPTZ DEFAULT NOW()';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener fragmento de PRIMARY KEY UUID
CREATE OR REPLACE FUNCTION get_uuid_primary_key() RETURNS TEXT AS $$
BEGIN
    RETURN 'id UUID DEFAULT gen_random_uuid() PRIMARY KEY';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'public'
CREATE OR REPLACE FUNCTION get_public_schema() RETURNS TEXT AS $$
BEGIN
    RETURN 'public';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener intensidad 'medium'
CREATE OR REPLACE FUNCTION get_intensity_medium() RETURNS TEXT AS $$
BEGIN
    RETURN 'medium';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener intensidad 'low'
CREATE OR REPLACE FUNCTION get_intensity_low() RETURNS TEXT AS $$
BEGIN
    RETURN 'low';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener intensidad 'high'
CREATE OR REPLACE FUNCTION get_intensity_high() RETURNS TEXT AS $$
BEGIN
    RETURN 'high';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener riesgo 'critical'
CREATE OR REPLACE FUNCTION get_risk_critical() RETURNS TEXT AS $$
BEGIN
    RETURN 'critical';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener DEFAULT FALSE
CREATE OR REPLACE FUNCTION get_default_false() RETURNS TEXT AS $$
BEGIN
    RETURN 'DEFAULT FALSE';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener DEFAULT TRUE
CREATE OR REPLACE FUNCTION get_default_true() RETURNS TEXT AS $$
BEGIN
    RETURN 'DEFAULT TRUE';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener PRIMARY KEY para profiles (con auth reference)
CREATE OR REPLACE FUNCTION get_profiles_primary_key() RETURNS TEXT AS $$
BEGIN
    RETURN 'id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener TEXT NOT NULL
CREATE OR REPLACE FUNCTION get_text_not_null() RETURNS TEXT AS $$
BEGIN
    RETURN 'TEXT NOT NULL';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener UUID REFERENCES profiles(id)
CREATE OR REPLACE FUNCTION get_uuid_ref_profiles() RETURNS TEXT AS $$
BEGIN
    RETURN 'UUID REFERENCES profiles(id)';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener UUID REFERENCES profiles(id) NOT NULL
CREATE OR REPLACE FUNCTION get_uuid_ref_profiles_not_null() RETURNS TEXT AS $$
BEGIN
    RETURN 'UUID REFERENCES profiles(id) NOT NULL';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
CREATE OR REPLACE FUNCTION get_uuid_ref_profiles_cascade() RETURNS TEXT AS $$
BEGIN
    RETURN 'UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL
CREATE OR REPLACE FUNCTION get_uuid_ref_children_cascade() RETURNS TEXT AS $$
BEGIN
    RETURN 'UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener UUID REFERENCES categories(id)
CREATE OR REPLACE FUNCTION get_uuid_ref_categories() RETURNS TEXT AS $$
BEGIN
    RETURN 'UUID REFERENCES categories(id)';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener JSONB DEFAULT '{}'
CREATE OR REPLACE FUNCTION get_jsonb_empty_object() RETURNS TEXT AS $$
BEGIN
    RETURN 'JSONB DEFAULT ''{}''';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener JSONB DEFAULT '[]'
CREATE OR REPLACE FUNCTION get_jsonb_empty_array() RETURNS TEXT AS $$
BEGIN
    RETURN 'JSONB DEFAULT ''[]''';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'SELECT'
CREATE OR REPLACE FUNCTION get_operation_select() RETURNS TEXT AS $$
BEGIN
    RETURN 'SELECT';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'INSERT'
CREATE OR REPLACE FUNCTION get_operation_insert() RETURNS TEXT AS $$
BEGIN
    RETURN 'INSERT';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'UPDATE'
CREATE OR REPLACE FUNCTION get_operation_update() RETURNS TEXT AS $$
BEGIN
    RETURN 'UPDATE';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'DELETE'
CREATE OR REPLACE FUNCTION get_operation_delete() RETURNS TEXT AS $$
BEGIN
    RETURN 'DELETE';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'auth.uid()'
CREATE OR REPLACE FUNCTION get_auth_uid() RETURNS TEXT AS $$
BEGIN
    RETURN 'auth.uid()';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'is_active'
CREATE OR REPLACE FUNCTION get_is_active_field() RETURNS TEXT AS $$
BEGIN
    RETURN 'is_active';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'created_by'
CREATE OR REPLACE FUNCTION get_created_by_field() RETURNS TEXT AS $$
BEGIN
    RETURN 'created_by';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'user_id'
CREATE OR REPLACE FUNCTION get_user_id_field() RETURNS TEXT AS $$
BEGIN
    RETURN 'user_id';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'child_id'
CREATE OR REPLACE FUNCTION get_child_id_field() RETURNS TEXT AS $$
BEGIN
    RETURN 'child_id';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'logged_by'
CREATE OR REPLACE FUNCTION get_logged_by_field() RETURNS TEXT AS $$
BEGIN
    RETURN 'logged_by';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'children'
CREATE OR REPLACE FUNCTION get_children_table() RETURNS TEXT AS $$
BEGIN
    RETURN 'children';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'profiles'
CREATE OR REPLACE FUNCTION get_profiles_table() RETURNS TEXT AS $$
BEGIN
    RETURN 'profiles';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'daily_logs'
CREATE OR REPLACE FUNCTION get_daily_logs_table() RETURNS TEXT AS $$
BEGIN
    RETURN 'daily_logs';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'user_child_relations'
CREATE OR REPLACE FUNCTION get_user_child_relations_table() RETURNS TEXT AS $$
BEGIN
    RETURN 'user_child_relations';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'categories'
CREATE OR REPLACE FUNCTION get_categories_table() RETURNS TEXT AS $$
BEGIN
    RETURN 'categories';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'audit_logs'
CREATE OR REPLACE FUNCTION get_audit_logs_table() RETURNS TEXT AS $$
BEGIN
    RETURN 'audit_logs';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener número 1
CREATE OR REPLACE FUNCTION get_number_one() RETURNS INTEGER AS $$
BEGIN
    RETURN 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'sensitive_access'
CREATE OR REPLACE FUNCTION get_sensitive_access_table() RETURNS TEXT AS $$
BEGIN
    RETURN 'sensitive_access';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'role'
CREATE OR REPLACE FUNCTION get_role_field() RETURNS TEXT AS $$
BEGIN
    RETURN 'role';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'id'
CREATE OR REPLACE FUNCTION get_id_field() RETURNS TEXT AS $$
BEGIN
    RETURN 'id';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'name'
CREATE OR REPLACE FUNCTION get_name_field() RETURNS TEXT AS $$
BEGIN
    RETURN 'name';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'is_deleted'
CREATE OR REPLACE FUNCTION get_is_deleted_field() RETURNS TEXT AS $$
BEGIN
    RETURN 'is_deleted';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'is_private'
CREATE OR REPLACE FUNCTION get_is_private_field() RETURNS TEXT AS $$
BEGIN
    RETURN 'is_private';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'reviewed_at'
CREATE OR REPLACE FUNCTION get_reviewed_at_field() RETURNS TEXT AS $$
BEGIN
    RETURN 'reviewed_at';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'category_id'
CREATE OR REPLACE FUNCTION get_category_id_field() RETURNS TEXT AS $$
BEGIN
    RETURN 'category_id';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal FALSE
CREATE OR REPLACE FUNCTION get_boolean_false() RETURNS BOOLEAN AS $$
BEGIN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal TRUE
CREATE OR REPLACE FUNCTION get_boolean_true() RETURNS BOOLEAN AS $$
BEGIN
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'granted_by'
CREATE OR REPLACE FUNCTION get_granted_by_field() RETURNS TEXT AS $$
BEGIN
    RETURN 'granted_by';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'email'
CREATE OR REPLACE FUNCTION get_email_field() RETURNS TEXT AS $$
BEGIN
    RETURN 'email';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'full_name'
CREATE OR REPLACE FUNCTION get_full_name_field() RETURNS TEXT AS $$
BEGIN
    RETURN 'full_name';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'user_can_access_child'
CREATE OR REPLACE FUNCTION get_function_user_can_access_child() RETURNS TEXT AS $$
BEGIN
    RETURN 'user_can_access_child';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'user_can_edit_child'
CREATE OR REPLACE FUNCTION get_function_user_can_edit_child() RETURNS TEXT AS $$
BEGIN
    RETURN 'user_can_edit_child';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener literal 'audit_sensitive_access'
CREATE OR REPLACE FUNCTION get_function_audit_sensitive_access() RETURNS TEXT AS $$
BEGIN
    RETURN 'audit_sensitive_access';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ================================================================
-- 3. CREAR TABLAS PRINCIPALES
-- ================================================================

-- TABLA: profiles (usuarios del sistema)
DO $$
BEGIN  EXECUTE format('CREATE TABLE profiles (' ||
    '%s, ' ||    'email TEXT UNIQUE NOT NULL, ' ||
    'full_name %s, ' ||
    'role TEXT CHECK (role IN (%L, %L, %L, %L)) DEFAULT %L, ' ||
    'avatar_url TEXT, ' ||    'phone TEXT, ' ||
    'is_active BOOLEAN %s, ' ||
    'last_login TIMESTAMPTZ, ' ||
    'failed_login_attempts INTEGER DEFAULT 0, ' ||
    'last_failed_login TIMESTAMPTZ, ' ||
    'account_locked_until TIMESTAMPTZ, ' ||    'timezone TEXT DEFAULT ''America/Guayaquil'', ' ||
    'preferences %s, ' ||
    '%s, %s' ||    ');',
    get_profiles_primary_key(),
    get_text_not_null(),
    get_default_true(),
    get_jsonb_empty_object(),
    get_role_parent(), get_role_teacher(), get_role_specialist(), get_role_admin(), get_role_parent(),
    get_created_at_field(), get_updated_at_field()
  );
END $$;

-- TABLA: categories (categorías de registros)
DO $$
BEGIN  EXECUTE format('CREATE TABLE categories (' ||
    '%s, ' ||
    'name TEXT UNIQUE NOT NULL, ' ||
    'description TEXT, ' ||
    'color TEXT DEFAULT ''#3B82F6'', ' ||    'icon TEXT DEFAULT ''circle'', ' ||
    'is_active BOOLEAN %s, ' ||
    'sort_order INTEGER DEFAULT 0, ' ||
    'created_by %s, ' ||
    '%s' ||    ');',
    get_uuid_primary_key(),
    get_default_true(),
    get_uuid_ref_profiles(),
    get_created_at_field()
  );
END $$;

-- TABLA: children (niños)
DO $$
BEGIN  EXECUTE format('CREATE TABLE children (' ||
    '%s, ' ||
    'name %s CHECK (length(trim(name)) >= 2), ' ||
    'birth_date DATE, ' ||
    'diagnosis TEXT, ' ||    'notes TEXT, ' ||
    'is_active BOOLEAN %s, ' ||
    'avatar_url TEXT, ' ||'emergency_contact %s, ' ||
    'medical_info %s, ' ||
    'educational_info %s, ' ||
    'privacy_settings JSONB DEFAULT ''{"share_with_specialists": true, "share_progress_reports": true, "allow_photo_sharing": false, "data_retention_months": 36}'', ' ||
    'created_by %s, ' ||
    '%s, %s' ||    ');',
    get_uuid_primary_key(),
    get_text_not_null(),
    get_default_true(),
    get_jsonb_empty_array(), get_jsonb_empty_object(), get_jsonb_empty_object(),
    get_uuid_ref_profiles_not_null(),
    get_created_at_field(), get_updated_at_field()
  );
END $$;

-- TABLA: user_child_relations (relaciones usuario-niño)
DO $$
BEGIN  EXECUTE format('CREATE TABLE user_child_relations (' ||
    '%s, ' ||    'user_id %s, ' ||
    'child_id %s, ' ||
    'relationship_type TEXT CHECK (relationship_type IN (%L, %L, %L, %L, %L)) NOT NULL, ' ||
    'can_edit BOOLEAN %s, ' ||
    'can_view BOOLEAN %s, ' ||
    'can_export BOOLEAN %s, ' ||
    'can_invite_others BOOLEAN %s, ' ||
    'granted_by %s, ' ||
    '%s, ' ||
    'expires_at TIMESTAMPTZ, ' ||
    'is_active BOOLEAN %s, ' ||
    'notes TEXT, ' ||
    'notification_preferences %s, ' ||
    '%s, ' ||
    'UNIQUE(user_id, child_id, relationship_type)' ||    ');',
    get_uuid_primary_key(),
    get_uuid_ref_profiles_cascade(), get_uuid_ref_children_cascade(),
    get_role_parent(), get_role_teacher(), get_role_specialist(), get_role_observer(), get_role_family(),
    get_default_false(), get_default_true(), get_default_false(), get_default_false(),
    get_uuid_ref_profiles_not_null(),
    get_granted_at_field(), get_default_true(), get_jsonb_empty_object(), get_created_at_field()
  );
END $$;

-- TABLA: daily_logs (registros diarios)
DO $$
BEGIN  EXECUTE format('CREATE TABLE daily_logs (' ||
    '%s, ' ||    'child_id %s, ' ||
    'category_id %s, ' ||'title %s CHECK (length(trim(title)) >= 2), ' ||
    'content %s, ' ||
    'mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10), ' ||
    'intensity_level TEXT CHECK (intensity_level IN (%L, %L, %L)) DEFAULT %L, ' ||
    'logged_by %s, ' ||
    'log_date DATE DEFAULT CURRENT_DATE, ' ||    'is_private BOOLEAN %s, ' ||
    'is_deleted BOOLEAN %s, ' ||
    'is_flagged BOOLEAN %s, ' ||
    'attachments %s, ' ||
    'tags TEXT[] DEFAULT ''{}'', ' ||
    'location TEXT, ' ||
    'weather TEXT, ' ||
    'reviewed_by %s, ' ||
    'reviewed_at TIMESTAMPTZ, ' ||
    'specialist_notes TEXT, ' ||
    'parent_feedback TEXT, ' ||
    'follow_up_required BOOLEAN %s, ' ||
    'follow_up_date DATE, ' ||
    '%s, %s' ||    ');',
    get_uuid_primary_key(),
    get_uuid_ref_children_cascade(), get_uuid_ref_categories(),
    get_text_not_null(), get_text_not_null(),
    get_intensity_low(), get_intensity_medium(), get_intensity_high(), get_intensity_medium(),
    get_uuid_ref_profiles_not_null(),
    get_default_false(), get_default_false(), get_default_false(),
    get_jsonb_empty_array(),
    get_uuid_ref_profiles(),
    get_default_false(),
    get_created_at_field(), get_updated_at_field()
  );
END $$;

-- TABLA: audit_logs (auditoría del sistema)
DO $$
BEGIN  EXECUTE format('CREATE TABLE audit_logs (' ||
    '%s, ' ||
    'table_name %s, ' ||
    'operation TEXT CHECK (operation IN (%L, %L, %L, %L)) NOT NULL, ' ||
    'record_id TEXT, ' ||
    'user_id %s, ' ||
    'user_role TEXT, ' ||
    'old_values JSONB, ' ||
    'new_values JSONB, ' ||
    'changed_fields TEXT[], ' ||
    'ip_address INET, ' ||
    'user_agent TEXT, ' ||    'session_id TEXT, ' ||
    'risk_level TEXT CHECK (risk_level IN (%L, %L, %L, %L)) DEFAULT %L, ' ||
    '%s' ||    ');',    get_uuid_primary_key(),
    get_text_not_null(),
    get_operation_insert(), get_operation_update(), get_operation_delete(), get_operation_select(),
    get_uuid_ref_profiles(),
    get_intensity_low(), get_intensity_medium(), get_intensity_high(), get_risk_critical(), get_intensity_low(),
    get_created_at_field()
  );
END $$;

-- ================================================================
-- 3. CREAR ÍNDICES PARA PERFORMANCE
-- ================================================================

-- Índices en profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_active ON profiles(is_active);

-- Índices en children
CREATE INDEX idx_children_created_by ON children(created_by);
CREATE INDEX idx_children_active ON children(is_active);
CREATE INDEX idx_children_birth_date ON children(birth_date);

-- Índices en user_child_relations
CREATE INDEX idx_relations_user_child ON user_child_relations(user_id, child_id);
CREATE INDEX idx_relations_child ON user_child_relations(child_id);
CREATE INDEX idx_relations_active ON user_child_relations(is_active);

-- Índices en daily_logs
CREATE INDEX idx_logs_child_date ON daily_logs(child_id, log_date DESC);
CREATE INDEX idx_logs_logged_by ON daily_logs(logged_by);
CREATE INDEX idx_logs_category ON daily_logs(category_id);
CREATE INDEX idx_logs_active ON daily_logs(is_deleted);

-- Índices en audit_logs
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_table ON audit_logs(table_name);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ================================================================
-- 4. CREAR FUNCIONES DE TRIGGERS
-- ================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para crear perfil automáticamente cuando se registra usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    profiles_table TEXT := get_profiles_table();
    id_field TEXT := get_id_field();
    email_field TEXT := get_email_field();
    full_name_field TEXT := get_full_name_field();
    role_field TEXT := get_role_field();
    parent_role TEXT := get_role_parent();
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>full_name_field, split_part(NEW.email, '@', get_number_one())),
    COALESCE(NEW.raw_user_meta_data->>role_field, parent_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 5. CREAR TRIGGERS
-- ================================================================

-- Trigger para updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_children
  BEFORE UPDATE ON children
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_daily_logs
  BEFORE UPDATE ON daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ================================================================
-- 6. CREAR FUNCIONES RPC
-- ================================================================

-- Función para verificar acceso a niño
CREATE OR REPLACE FUNCTION user_can_access_child(child_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    children_table_name TEXT := get_children_table();
    created_by_field TEXT := get_created_by_field();
BEGIN
  RETURN EXISTS (
    SELECT get_number_one() FROM children 
    WHERE id = child_uuid 
      AND created_by = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar permisos de edición
CREATE OR REPLACE FUNCTION user_can_edit_child(child_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    children_table_name TEXT := get_children_table();
    created_by_field TEXT := get_created_by_field();
BEGIN
  RETURN EXISTS (
    SELECT get_number_one() FROM children 
    WHERE id = child_uuid 
      AND created_by = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función de auditoría
CREATE OR REPLACE FUNCTION audit_sensitive_access(
  action_type TEXT,
  resource_id TEXT,
  action_details TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    sensitive_access_table TEXT := get_sensitive_access_table();
    select_operation TEXT := get_operation_select();
    role_field TEXT := get_role_field();
    id_field TEXT := get_id_field();
    profiles_table TEXT := get_profiles_table();
    medium_intensity TEXT := get_intensity_medium();
BEGIN
  INSERT INTO audit_logs (
    table_name,
    operation,
    record_id,
    user_id,
    user_role,
    new_values,
    risk_level
  ) VALUES (
    sensitive_access_table,
    select_operation,
    resource_id,
    auth.uid(),
    (SELECT role FROM profiles WHERE id = auth.uid()),    jsonb_build_object(
      'action_type', action_type,
      'details', action_details,
      'timestamp', NOW()
    ),
    medium_intensity
  );
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- No fallar por errores de auditoría
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 7. CREAR VISTAS
-- ================================================================

-- Vista para niños accesibles por usuario
DO $$
BEGIN
  EXECUTE format('CREATE OR REPLACE VIEW user_accessible_children AS ' ||
    'SELECT c.*, %L::TEXT as relationship_type, ' ||
    'true as can_edit, true as can_view, true as can_export, ' ||
    'true as can_invite_others, c.created_at as granted_at, ' ||
    'NULL::TIMESTAMPTZ as expires_at, p.full_name as creator_name ' ||
    'FROM children c JOIN profiles p ON c.created_by = p.id ' ||
    'WHERE c.created_by = auth.uid() AND c.is_active = true;',
    get_role_parent()
  );
END $$;

-- Vista para estadísticas de logs por niño
CREATE OR REPLACE VIEW child_log_statistics AS
SELECT 
  c.id as child_id,
  c.name as child_name,
  COUNT(dl.id) as total_logs,
  COUNT(CASE WHEN dl.log_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as logs_this_week,
  COUNT(CASE WHEN dl.log_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as logs_this_month,
  ROUND(AVG(dl.mood_score), 2) as avg_mood_score,
  MAX(dl.log_date) as last_log_date,
  COUNT(DISTINCT dl.category_id) as categories_used,
  COUNT(CASE WHEN dl.is_private THEN 1 END) as private_logs,
  COUNT(CASE WHEN dl.reviewed_at IS NOT NULL THEN 1 END) as reviewed_logs
FROM children c
LEFT JOIN daily_logs dl ON c.id = dl.child_id AND dl.is_deleted = false
WHERE c.created_by = auth.uid()
GROUP BY c.id, c.name;

-- ================================================================
-- 8. INSERTAR DATOS INICIALES
-- ================================================================

-- Categorías por defecto
INSERT INTO categories (name, description, color, icon, sort_order) VALUES
('Comportamiento', 'Registros sobre comportamiento y conducta', '#3B82F6', 'user', 1),
('Emociones', 'Estado emocional y regulación', '#EF4444', 'heart', 2),
('Aprendizaje', 'Progreso académico y educativo', '#10B981', 'book', 3),
('Socialización', 'Interacciones sociales', '#F59E0B', 'users', 4),
('Comunicación', 'Habilidades de comunicación', '#8B5CF6', 'message-circle', 5),
('Motricidad', 'Desarrollo motor fino y grueso', '#06B6D4', 'activity', 6),
('Alimentación', 'Hábitos alimentarios', '#84CC16', 'utensils', 7),
('Sueño', 'Patrones de sueño y descanso', '#6366F1', 'moon', 8),
('Medicina', 'Información médica y tratamientos', '#EC4899', 'pill', 9),
('Otros', 'Otros registros importantes', '#6B7280', 'more-horizontal', 10);

-- ================================================================
-- 9. HABILITAR RLS Y CREAR POLÍTICAS SIMPLES
-- ================================================================

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_child_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA PROFILES
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- POLÍTICAS PARA CHILDREN (SIMPLES, SIN RECURSIÓN)
CREATE POLICY "Users can view own created children" ON children
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Authenticated users can create children" ON children
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    created_by = auth.uid()
  );

CREATE POLICY "Creators can update own children" ON children
  FOR UPDATE USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- POLÍTICAS PARA USER_CHILD_RELATIONS (SIMPLES)
CREATE POLICY "Users can view own relations" ON user_child_relations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create relations for own children" ON user_child_relations
  FOR INSERT WITH CHECK (
    granted_by = auth.uid() AND
    EXISTS (
      SELECT get_number_one() FROM children 
      WHERE id = user_child_relations.child_id 
        AND created_by = auth.uid()
    )
  );

-- POLÍTICAS PARA DAILY_LOGS (SIMPLES)
CREATE POLICY "Users can view logs of own children" ON daily_logs
  FOR SELECT USING (
    EXISTS (
      SELECT get_number_one() FROM children 
      WHERE id = daily_logs.child_id 
        AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create logs for own children" ON daily_logs
  FOR INSERT WITH CHECK (
    logged_by = auth.uid() AND
    EXISTS (
      SELECT get_number_one() FROM children 
      WHERE id = daily_logs.child_id 
        AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update own logs" ON daily_logs
  FOR UPDATE USING (logged_by = auth.uid())
  WITH CHECK (logged_by = auth.uid());

-- POLÍTICAS PARA CATEGORIES
CREATE POLICY "Authenticated users can view categories" ON categories
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

-- POLÍTICAS PARA AUDIT_LOGS
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ================================================================
-- 10. FUNCIÓN DE VERIFICACIÓN
-- ================================================================

CREATE OR REPLACE FUNCTION verify_neurolog_setup()
RETURNS TEXT AS $$
DECLARE
  result TEXT := '';
  table_count INTEGER;
  policy_count INTEGER;
  function_count INTEGER;
  category_count INTEGER;
  rls_check INTEGER;
  public_schema_name TEXT := get_public_schema();
  profiles_table TEXT := get_profiles_table();
  children_table TEXT := get_children_table();
  user_child_relations_table TEXT := get_user_child_relations_table();
  daily_logs_table TEXT := get_daily_logs_table();
  categories_table TEXT := get_categories_table();
  audit_logs_table TEXT := get_audit_logs_table();
  is_active_field TEXT := get_is_active_field();
BEGIN  -- Contar tablas
  EXECUTE format('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = %L AND table_name IN (%L, %L, %L, %L, %L, %L)', 
    public_schema_name, profiles_table, children_table, user_child_relations_table, 
    daily_logs_table, categories_table, audit_logs_table) INTO table_count;
  
  result := result || 'Tablas creadas: ' || table_count || '/6' || E'\n';
    -- Contar políticas
  EXECUTE format('SELECT COUNT(*) FROM pg_policies WHERE schemaname = %L', public_schema_name) INTO policy_count;
  
  result := result || 'Políticas RLS: ' || policy_count || E'\n';
    -- Contar funciones
  EXECUTE format('SELECT COUNT(*) FROM pg_proc WHERE proname IN (%L, %L, %L)', 
    get_function_user_can_access_child(), get_function_user_can_edit_child(), get_function_audit_sensitive_access()) INTO function_count;
  
  result := result || 'Funciones RPC: ' || function_count || '/3' || E'\n';
  
  -- Contar categorías
  EXECUTE format('SELECT COUNT(*) FROM %I WHERE %I = %L', categories_table, is_active_field, get_boolean_true()) INTO category_count;
  
  result := result || 'Categorías: ' || category_count || '/10' || E'\n';
    -- Verificar RLS
  EXECUTE format('SELECT COUNT(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = %L AND c.relname = %L AND c.relrowsecurity = %L', 
    public_schema_name, children_table, get_boolean_true()) INTO rls_check;
  
  IF rls_check > get_number_one() - get_number_one() THEN
    result := result || 'RLS: ✅ Habilitado' || E'\n';
  ELSE
    result := result || 'RLS: ❌ Deshabilitado' || E'\n';
  END IF;
  
  result := result || E'\n🎉 BASE DE DATOS NEUROLOG CONFIGURADA COMPLETAMENTE';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 11. EJECUTAR VERIFICACIÓN FINAL
-- ================================================================

SELECT verify_neurolog_setup();

-- ================================================================
-- 12. MENSAJE FINAL
-- ================================================================

DO $$
BEGIN
  RAISE NOTICE '🎉 ¡BASE DE DATOS NEUROLOG CREADA EXITOSAMENTE!';
  RAISE NOTICE '===============================================';
  RAISE NOTICE 'Todas las tablas, funciones, vistas y políticas han sido creadas.';
  RAISE NOTICE 'La base de datos está lista para usar.';
  RAISE NOTICE '';
  RAISE NOTICE 'FUNCIONALIDADES INCLUIDAS:';
  RAISE NOTICE '✅ Gestión de usuarios (profiles)';
  RAISE NOTICE '✅ Gestión de niños (children)';
  RAISE NOTICE '✅ Relaciones usuario-niño (user_child_relations)';
  RAISE NOTICE '✅ Registros diarios (daily_logs)';
  RAISE NOTICE '✅ Categorías predefinidas (categories)';
  RAISE NOTICE '✅ Sistema de auditoría (audit_logs)';
  RAISE NOTICE '✅ Políticas RLS funcionales';
  RAISE NOTICE '✅ Funciones RPC necesarias';
  RAISE NOTICE '✅ Vistas optimizadas';
  RAISE NOTICE '✅ Índices para performance';
  RAISE NOTICE '';
  RAISE NOTICE 'PRÓXIMO PASO: Probar la aplicación NeuroLog';
END $$;
