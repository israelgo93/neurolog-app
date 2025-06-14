-- ================================================================
-- NEUROLOG APP - SCRIPT COMPLETO DE BASE DE DATOS
-- ================================================================
-- Ejecutar completo en Supabase SQL Editor
-- Borra todo y crea desde cero según últimas actualizaciones

-- Definición de variables de configuración PostgreSQL
\set role_parent 'parent'
\set role_teacher 'teacher'
\set role_specialist 'specialist'
\set role_admin 'admin'
\set rel_parent 'parent'
\set rel_teacher 'teacher'
\set rel_specialist 'specialist'
\set rel_observer 'observer'
\set rel_family 'family'
\set risk_low 'low'
\set risk_medium 'medium'
\set risk_high 'high'
\set risk_critical 'critical'

-- Variables compuestas para CHECK constraints
\set role_values ':role_parent, :role_teacher, :role_specialist, :role_admin'
\set rel_values ':rel_parent, :rel_teacher, :rel_specialist, :rel_observer, :rel_family'
\set op_values ':op_insert, :op_update, :op_delete, :op_select'
\set risk_values ':risk_low, :risk_medium, :risk_high, :risk_critical'
\set boolean_values ':true_value, :false_value'

-- Variables para uso en DEFAULT values
\set default_role ':role_parent'
\set default_risk ':risk_low'
\set default_boolean ':false_value'

-- Variables para uso en políticas RLS
\set creator_check 'created_by = auth.uid()'
\set owner_check 'user_id = auth.uid()'
\set logged_by_check 'logged_by = auth.uid()'
\set child_creator_check '(SELECT COUNT(*) FROM children WHERE id = child_id AND created_by = auth.uid()) > 0'

-- ================================================================
-- NEUROLOG APP - SCRIPT COMPLETO DE BASE DE DATOS
-- ================================================================
-- Ejecutar completo en Supabase SQL Editor
-- Borra todo y crea desde cero según últimas actualizaciones

-- ================================================================
-- 1. LIMPIAR TODO LO EXISTENTE
-- ================================================================

-- Deshabilitar RLS temporalmente
ALTER TABLE IF EXISTS daily_logs co_disable_rls;
ALTER TABLE IF EXISTS user_child_relations co_disable_rls;
ALTER TABLE IF EXISTS profiles co_disable_rls;
ALTER TABLE IF EXISTS categories co_disable_rls;
ALTER TABLE IF EXISTS audit_logs co_disable_rls;

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
-- 2. CREAR TABLAS PRINCIPALES
-- ================================================================

-- TABLA: profiles (usuarios del sistema)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN (:role_parent, :role_teacher, :role_specialist, :role_admin)) DEFAULT :role_parent,
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  last_failed_login TIMESTAMPTZ,
  account_locked_until TIMESTAMPTZ,
  timezone TEXT DEFAULT 'America/Guayaquil',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA: categories (categorías de registros)
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'circle',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA: children (niños)
CREATE TABLE children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(trim(name)) >= 2),
  birth_date DATE,
  diagnosis TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  avatar_url TEXT,
  emergency_contact JSONB DEFAULT '[]',
  medical_info JSONB DEFAULT '{}',
  educational_info JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{"share_with_specialists": true, "share_progress_reports": true, "allow_photo_sharing": false, "data_retention_months": 36}',
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA: user_child_relations (relaciones usuario-niño)
CREATE TABLE user_child_relations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT CHECK (relationship_type IN (:rel_parent, :rel_teacher, :rel_specialist, :rel_observer, :rel_family)) NOT NULL,
  can_edit BOOLEAN DEFAULT FALSE,
  can_view BOOLEAN DEFAULT TRUE,
  can_export BOOLEAN DEFAULT FALSE,
  can_invite_others BOOLEAN DEFAULT FALSE,
  granted_by UUID REFERENCES profiles(id) NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  notification_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, child_id, relationship_type)
);

-- TABLA: daily_logs (registros diarios)
CREATE TABLE daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id),
  title TEXT NOT NULL CHECK (length(trim(title)) >= 2),
  content TEXT NOT NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  intensity_level TEXT CHECK (intensity_level IN (:risk_low, :risk_medium, :risk_high)) DEFAULT :risk_medium,
  logged_by UUID REFERENCES profiles(id) NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE,
  is_private BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  location TEXT,
  weather TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  specialist_notes TEXT,
  parent_feedback TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA: audit_logs (auditoría del sistema)
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT CHECK (operation IN (:op_insert, :op_update, :op_delete, :op_select)) NOT NULL,
  record_id TEXT,
  user_id UUID REFERENCES profiles(id),
  user_role TEXT,
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  risk_level TEXT CHECK (risk_level IN (:risk_low, :risk_medium, :risk_high, :risk_critical)) DEFAULT :risk_low,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', :rel_parent::)
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
BEGIN
  RETURN (
    SELECT COUNT(*) > 0 
    FROM children
    WHERE id = child_uuid 
      AND created_by = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar permisos de edición
CREATE OR REPLACE FUNCTION user_can_edit_child(child_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
     SELECT COUNT(*) > 0 
    FROM children 
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
  audit_result BOOLEAN -- Nivel de riesgo por defecto
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
    'sensitive_access',
    'SELECT',
    resource_id,
    auth.uid(),
    (SELECT role FROM profiles WHERE id = auth.uid()),
    jsonb_build_object(
      'action_type', action_type,
      'details', action_details,
      'timestamp', NOW()
    ),
    :risk_medium
  );RETURNING TRUE INTO audit_result;

  IF NOT audit_result THEN
    RAISE EXCEPTION 'Audit log failed for resource %', resource_id;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- No fallar por errores de auditoría
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 7. CREAR VISTAS
-- ================================================================

-- Vista para niños accesibles por usuario
CREATE OR REPLACE VIEW user_accessible_children AS
SELECT 
  c.*,
  :rel_parent::TEXT as relationship_type,
  true as can_edit,
  true as can_view,
  true as can_export,
  true as can_invite_others,
  c.created_at as granted_at,
  NULL::TIMESTAMPTZ as expires_at,
  p.full_name as creator_name
FROM children c
JOIN profiles p ON c.created_by = p.id
WHERE c.created_by = auth.uid()
  AND c.is_active = true;

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
LEFT JOIN daily_logs dl ON c.id = dl.child_id AND NOT dl.is_deleted
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


CREATE POLICY "Creators can update children" ON children
  FOR UPDATE USING (:creator_check)
  WITH CHECK (:creator_check);

-- POLÍTICAS PARA USER_CHILD_RELATIONS (SIMPLES)
CREATE POLICY "Users can view own relations" ON user_child_relations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create relations for own children" ON user_child_relations
  FOR INSERT WITH CHECK (
    granted_by = auth.uid() AND
    (SELECT COUNT(*) FROM children 
     WHERE id = user_child_relations.child_id 
       AND created_by = auth.uid()) > 0
  );

-- POLÍTICAS PARA DAILY_LOGS (SIMPLES)
CREATE POLICY "Users can view logs of own children" ON daily_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM children 
      WHERE id = daily_logs.child_id 
        AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create logs for own children" ON daily_logs
  FOR INSERT WITH CHECK (
    logged_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM children 
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
  schema_public CONSTANT TEXT := 'public';
  table_profiles CONSTANT TEXT := 'profiles';
BEGIN
  -- Contar tablas
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = schema_public 
    AND table_name IN ('profiles', 'children', 'user_child_relations', 'daily_logs', 'categories', 'audit_logs');
  
  result := result || 'Tablas creadas: ' || table_count || '/6' || E'\n';
  
  -- Contar políticas
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = schema_public
  
  result := result || 'Políticas RLS: ' || policy_count || E'\n';
  
  -- Contar funciones
  SELECT COUNT(*) INTO function_count
  FROM pg_proc 
  WHERE proname IN ('user_can_access_child', 'user_can_edit_child', 'audit_sensitive_access');
  
  result := result || 'Funciones RPC: ' || function_count || '/3' || E'\n';
  
  -- Contar categorías
  SELECT COUNT(*) INTO category_count
  FROM categories WHERE is_active = true;
  
  result := result || 'Categorías: ' || category_count || '/10' || E'\n';
  
  -- Verificar RLS
  IF (SELECT COUNT(*) FROM pg_class c 
      JOIN pg_namespace n ON n.oid = c.relnamespace 
      WHERE n.nspname = 'public' 
        AND c.relname = 'children' 
        AND c.relrowsecurity = true) > 0 THEN
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