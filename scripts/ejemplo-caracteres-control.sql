-- ====================================================-- ✅ SOLUCIÓN 2: E-strings con escape secuencias
INSERT INTO notas (titulo, contenido) VALUES
('Ideas con formato', 
 E'Algunas mejoras que se podrían implementar:\\n- Categorías para organizar notas\\n- Etiquetas\\n- Modo oscuro\\n- Exportar notas a PDF\\n- Búsqueda avanzada con filtros'),

('Lista de tareas con formato', 
 E'Cosas por hacer:\\n- Revisar el código\\n- Escribir pruebas unitarias\\n- Optimizar las consultas a la base de datos\\n- Añadir validaciones del lado cliente\\n- Configurar CI/CD'),

('Arquitectura del proyecto', 
 E'El proyecto sigue una arquitectura de 3 capas:\\n- Capa de presentación (Frontend)\\n- Capa de lógica de negocio (Backend)\\n- Capa de datos (Base de datos)');========
-- EJEMPLO: CORRECCIÓN DE CARACTERES DE CONTROL EN SQL
-- ================================================================
-- Este archivo demuestra cómo corregir caracteres de control problemáticos

-- ❌ CÓDIGO PROBLEMÁTICO REAL (punto de código 10 = salto de línea)
-- Este es el código exacto que causa errores de SonarQube:
/*
INSERT INTO notas (titulo, contenido) VALUES
('Bienvenido al Sistema de Notas','Esta es tu primera nota de ejemplo. Puedes crear, editar, buscar y eliminar notas fácilmente desde la interfaz web.'),
('Ideas para el Proyecto','Algunas mejoras que se podrían implementar:
- Categorías para organizar notas.
- Etiquetas
- Modo oscuro
- Exportar notas a PDF
- Búsqueda avanzada con filtros'),
('Lista de tareas','Cosas por hacer:
- Revisar el código
- Escribir pruebas unitarias
- Optimizar las consultas a la base de datos
- Añadir validaciones del lado cliente
- Configurar CI/CD'),
('Notas de Arquitectura','El proyecto sigue una arquitectura de 3 capas:
- Capa de presentación (Frontend)
- Capa de lógica de negocio (Backend)
- Capa de datos (Base de datos)');
*/

-- ✅ SOLUCIÓN 1: Concatenación con || (RECOMENDADO)
INSERT INTO notas (titulo, contenido) VALUES
('Bienvenido al Sistema de Notas', 
 'Esta es tu primera nota de ejemplo. Puedes crear, editar, buscar y eliminar notas fácilmente desde la interfaz web.'),

('Ideas para el Proyecto', 
 'Algunas mejoras que se podrían implementar: ' ||
 '- Categorías para organizar notas. ' ||
 '- Etiquetas ' ||
 '- Modo oscuro ' ||
 '- Exportar notas a PDF ' ||
 '- Búsqueda avanzada con filtros'),

('Lista de tareas', 
 'Cosas por hacer: ' ||
 '- Revisar el código ' ||
 '- Escribir pruebas unitarias ' ||
 '- Optimizar las consultas a la base de datos ' ||
 '- Añadir validaciones del lado cliente ' ||
 '- Configurar CI/CD'),

('Notas de Arquitectura', 
 'El proyecto sigue una arquitectura de 3 capas: ' ||
 '- Capa de presentación (Frontend) ' ||
 '- Capa de lógica de negocio (Backend) ' ||
 '- Capa de datos (Base de datos)');

-- ✅ SOLUCIÓN 2: E-strings con escape secuencias
INSERT INTO notas (titulo, contenido) VALUES
('Ideas con formato', E'Lista de mejoras:\\n- Categorías\\n- Etiquetas\\n- Modo oscuro'),
('Tareas pendientes', E'Por hacer:\\n1. Código\\n2. Pruebas\\n3. Documentación');

-- ✅ SOLUCIÓN 3: Múltiples INSERTs para contenido complejo
INSERT INTO notas (titulo, contenido) VALUES ('Proyecto Principal', 'Ideas para el proyecto de notas');
INSERT INTO notas (titulo, contenido) VALUES ('Mejora 1', 'Categorías para organizar notas');
INSERT INTO notas (titulo, contenido) VALUES ('Mejora 2', 'Sistema de etiquetas');
INSERT INTO notas (titulo, contenido) VALUES ('Mejora 3', 'Modo oscuro para la interfaz');

-- ✅ SOLUCIÓN 4: Usar variables para contenido largo (MEJOR PARA CASOS COMPLEJOS)
DO $$
DECLARE
    contenido_bienvenida TEXT;
    contenido_ideas TEXT;
    contenido_tareas TEXT;
    contenido_arquitectura TEXT;
BEGIN
    contenido_bienvenida := 'Esta es tu primera nota de ejemplo. ' ||
                           'Puedes crear, editar, buscar y eliminar notas ' ||
                           'fácilmente desde la interfaz web.';
    
    contenido_ideas := 'Algunas mejoras que se podrían implementar: ' ||
                      '- Categorías para organizar notas ' ||
                      '- Sistema de etiquetas ' ||
                      '- Modo oscuro para la interfaz ' ||
                      '- Funcionalidad de exportar a PDF ' ||
                      '- Búsqueda avanzada con filtros';
    
    contenido_tareas := 'Cosas por hacer en el proyecto: ' ||
                       '- Revisar y refactorizar el código ' ||
                       '- Escribir pruebas unitarias completas ' ||
                       '- Optimizar las consultas a la base de datos ' ||
                       '- Añadir validaciones del lado cliente ' ||
                       '- Configurar pipeline de CI/CD';
    
    contenido_arquitectura := 'El proyecto sigue una arquitectura de 3 capas bien definida: ' ||
                             '- Capa de presentación (Frontend con React/Next.js) ' ||
                             '- Capa de lógica de negocio (Backend con APIs RESTful) ' ||
                             '- Capa de datos (Base de datos PostgreSQL con Supabase)';
    
    INSERT INTO notas (titulo, contenido) VALUES
    ('Bienvenido al Sistema de Notas', contenido_bienvenida),
    ('Ideas para el Proyecto', contenido_ideas),
    ('Lista de Tareas Pendientes', contenido_tareas),
    ('Notas de Arquitectura del Sistema', contenido_arquitectura);
    
    RAISE NOTICE 'Insertadas % notas correctamente sin caracteres de control', 4;
END $$;

-- ================================================================
-- EXPLICACIÓN DETALLADA DEL PROBLEMA DE SONARQUBE
-- ================================================================
-- PROBLEMA: Carácter ilegal con punto de código 10 (Line Feed)
-- 
-- Los caracteres de control como \n (salto de línea) están embebidos
-- literalmente en el string SQL, lo que causa:
--
-- 1. Problemas de legibilidad del código
-- 2. Dificultades para el mantenimiento  
-- 3. Posibles vulnerabilidades de seguridad
-- 4. Violaciones de las reglas de SonarQube
--
-- CARACTERES PROBLEMÁTICOS:
-- - Punto de código 9  = Tab (\t)
-- - Punto de código 10 = Line Feed (\n) 
-- - Punto de código 13 = Carriage Return (\r)
--
-- DETECCIÓN: SonarQube detecta estos caracteres invisibles que pueden
-- ser inyectados accidentalmente o maliciosamente en el código.

-- ================================================================
-- FUNCIÓN DE DEMOSTRACIÓN: CORRECCIÓN DE CARACTERES DE CONTROL
-- ================================================================

CREATE OR REPLACE FUNCTION demo_correccion_caracteres()
RETURNS TABLE(metodo TEXT, ejemplo TEXT, es_correcto BOOLEAN) AS $$
BEGIN
    -- Método 1: Concatenación (Recomendado)
    RETURN QUERY SELECT 
        'Concatenación'::TEXT,
        ('Lista de tareas: ' || '- Tarea 1 ' || '- Tarea 2')::TEXT,
        true::BOOLEAN;
    
    -- Método 2: E-strings con escape
    RETURN QUERY SELECT 
        'E-strings'::TEXT,
        E'Lista de tareas:\\n- Tarea 1\\n- Tarea 2'::TEXT,
        true::BOOLEAN;
    
    -- Método 3: Formato JSON para estructuras complejas
    RETURN QUERY SELECT 
        'JSON estructurado'::TEXT,
        ('{"tipo": "lista", "items": ["Tarea 1", "Tarea 2"]}')::TEXT,
        true::BOOLEAN;
        
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- EJEMPLOS ADICIONALES EN FUNCIONES Y PROCEDURES
-- ================================================================

-- ❌ PROBLEMÁTICO en función: usar saltos de línea literales
-- Evitar crear funciones con caracteres de control embebidos

-- ✅ CORRECTO en función
CREATE OR REPLACE FUNCTION ejemplo_bueno()
RETURNS TEXT AS $$
BEGIN
    RETURN 'Línea 1 ' ||
           'Línea 2 ' ||
           'Línea 3';
END;
$$ LANGUAGE plpgsql;

-- ✅ ALTERNATIVA con E-strings
CREATE OR REPLACE FUNCTION ejemplo_con_escape()
RETURNS TEXT AS $$
BEGIN
    RETURN E'Línea 1\\nLínea 2\\nLínea 3';
END;
$$ LANGUAGE plpgsql;
