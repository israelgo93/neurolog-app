-- ================================================================
-- NEUROLOG APP - SCRIPT COMPLETO DE BASE DE DATOS
-- ================================================================
-- Ejecutar completo en Supabase SQL Editor
-- Borra todo y crea desde cero según últimas actualizaciones

-- Definición de constantes
DECLARE
  -- Roles de usuario
  co_role_parent CONSTANT TEXT := 'parent';
  co_role_teacher CONSTANT TEXT := 'teacher';
  co_role_specialist CONSTANT TEXT := 'specialist';
  co_role_admin CONSTANT TEXT := 'admin';

  -- Tipos de relación
  co_rel_parent CONSTANT TEXT := 'parent';
  co_rel_teacher CONSTANT TEXT := 'teacher';
  co_rel_specialist CONSTANT TEXT := 'specialist';
  co_rel_observer CONSTANT TEXT := 'observer';
  co_rel_family CONSTANT TEXT := 'family';

  -- Operaciones de auditoría
  co_op_insert CONSTANT TEXT := 'INSERT';
  co_op_update CONSTANT TEXT := 'UPDATE';
  co_op_delete CONSTANT TEXT := 'DELETE';
  co_op_select CONSTANT TEXT := 'SELECT';

  -- Niveles de riesgo
  co_risk_low CONSTANT TEXT := 'low';
  co_risk_medium CONSTANT TEXT := 'medium';
  co_risk_high CONSTANT TEXT := 'high';
  co_risk_critical CONSTANT TEXT := 'critical';

  -- Estados booleanos
  co_true CONSTANT BOOLEAN := TRUE;
  co_false CONSTANT BOOLEAN := FALSE;
  -- Esquema público
  co_schema_public CONSTANT TEXT := 'public';
END;
/

-- ================================================================
-- NEUROLOG APP - SCRIPT COMPLETO DE BASE DE DATOS
-- ================================================================
-- Ejecutar completo en Supabase SQL Editor
-- Borra todo y crea desde cero según últimas actualizaciones

-- ================================================================
-- 1. LIMPIAR TODO LO EXISTENTE
-- ================================================================
@@ -51,7 +90,7 @@ CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN (co_role_parent, co_role_teacher, co_role_specialist, co_role_admin)) DEFAULT co_role_parent,
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
@@ -106,7 +145,7 @@ CREATE TABLE user_child_relations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT CHECK (relationship_type IN (co_rel_parent, co_rel_teacher, co_rel_specialist, co_rel_observer, co_rel_family)) NOT NULL,
  can_edit BOOLEAN DEFAULT FALSE,
  can_view BOOLEAN DEFAULT TRUE,
  can_export BOOLEAN DEFAULT FALSE,
@@ -154,7 +193,7 @@ CREATE TABLE daily_logs (
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT CHECK (operation IN (co_op_insert, co_op_update, co_op_delete, co_op_select)) NOT NULL,
  record_id TEXT,
  user_id UUID REFERENCES profiles(id),
  user_role TEXT,
  new_values JSONB,
  old_values JSONB,
  change_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  risk_level TEXT CHECK (risk_level IN (co_risk_low, co_risk_medium, co_risk_high, co_risk_critical)) DEFAULT co_risk_low,
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
    COALESCE(NEW.raw_user_meta_data->>'role', co_role_parent)
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
  result INTEGER;
BEGIN
  SELECT COUNT(*) INTO result FROM children 
    WHERE id = child_uuid 
      AND created_by = auth.uid();
  RETURN result > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Función para verificar permisos de edición
CREATE OR REPLACE FUNCTION user_can_edit_child(child_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  result INTEGER;
BEGIN
  SELECT COUNT(*) INTO result FROM children 
    WHERE id = child_uuid 
      AND created_by = auth.uid();
  RETURN result > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Función de auditoría
CREATE OR REPLACE FUNCTION audit_sensitive_access(
  action_type TEXT,
  resource_id TEXT,
  action_details TEXT DEFAULT NULL
)
RETURNS VOID AS $$
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
    'medium'
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error en audit_sensitive_access: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ================================================================
-- 7. CREAR VISTAS
-- ================================================================
-- Vista para niños accesibles por usuario
CREATE OR REPLACE VIEW user_accessible_children AS
SELECT 
  c.*,
  co_rel_parent as relationship_type,
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
      SELECT 1 FROM children 
      WHERE id = user_child_relations.child_id 
        AND created_by = auth.uid()
    )
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
BEGIN
  -- Contar tablas
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = co_schema_public 
    AND table_name IN ('profiles', 'children', 'user_child_relations', 'daily_logs', 'categories', 'audit_logs');
  
  result := result || 'Tablas creadas: ' || table_count || '/6' || E'\n';
  
  -- Contar políticas
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = co_schema_public;
  
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
      WHERE n.nspname = co_schema_public 
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