-- ================================================================
-- DEMOSTRACIÓN: CORRECCIÓN DE INSERT CON CARACTERES DE CONTROL
-- ================================================================
-- Este archivo muestra cómo corregir el INSERT problemático específico

-- ❌ CÓDIGO PROBLEMÁTICO ORIGINAL (NO EJECUTAR - SOLO REFERENCIA)
-- SonarQube detecta "carácter ilegal con punto de código 10" en estos literales:
/*
-- Datos de prueba para la tabla de notas
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
1. Frontend (React) - Interfaz de usuario
2. Backend (Express) - API REST
3. Base de Datos (PostgreSQL/Supabase) - Persistencia
Esta separación permite escalabilidad y mantenimiento eficiente.'),
('Comandos Útiles','Comandos de Git más utilizados:
git add .
git commit -m "mensaje"
git push origin main
git pull origin main
git branch
git checkout -b nueva-rama');
*/

-- ================================================================
-- ✅ SOLUCIÓN 1: CONCATENACIÓN CON OPERADOR ||
-- ================================================================
-- Esta es la solución más legible y mantenible

-- Definir constantes para evitar duplicación de literales
DO $$
DECLARE
    co_titulo_bienvenida CONSTANT TEXT := 'Bienvenido al Sistema de Notas';
    co_titulo_ideas CONSTANT TEXT := 'Ideas para el Proyecto';
    co_titulo_tareas CONSTANT TEXT := 'Lista de tareas';
    co_titulo_arquitectura CONSTANT TEXT := 'Notas de Arquitectura';
    co_titulo_comandos CONSTANT TEXT := 'Comandos Útiles';
    
    co_filtros CONSTANT TEXT := '- Búsqueda avanzada con filtros';
    co_cicd CONSTANT TEXT := '- Configurar CI/CD';
BEGIN
    -- Crear tabla de ejemplo para demostración
    CREATE TABLE IF NOT EXISTS notas_demo (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        contenido TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- INSERT corregido con concatenación
    INSERT INTO notas_demo (titulo, contenido) VALUES

    (co_titulo_bienvenida, 
     'Esta es tu primera nota de ejemplo. Puedes crear, editar, buscar y eliminar notas fácilmente desde la interfaz web.'),

    (co_titulo_ideas, 
     'Algunas mejoras que se podrían implementar: ' ||
     '- Categorías para organizar notas. ' ||
     '- Etiquetas ' ||
     '- Modo oscuro ' ||
     '- Exportar notas a PDF ' ||
     co_filtros),

    (co_titulo_tareas, 
     'Cosas por hacer: ' ||
     '- Revisar el código ' ||
     '- Escribir pruebas unitarias ' ||
     '- Optimizar las consultas a la base de datos ' ||
     '- Añadir validaciones del lado cliente ' ||
     co_cicd),

    (co_titulo_arquitectura, 
     'El proyecto sigue una arquitectura de 3 capas: ' ||
     '1. Frontend (React) - Interfaz de usuario ' ||
     '2. Backend (Express) - API REST ' ||
     '3. Base de Datos (PostgreSQL/Supabase) - Persistencia ' ||
     'Esta separación permite escalabilidad y mantenimiento eficiente.'),

    (co_titulo_comandos, 
     'Comandos de Git más utilizados: ' ||
     'git add . ' ||
     'git commit -m "mensaje" ' ||
     'git push origin main ' ||
     'git pull origin main ' ||
     'git branch ' ||
     'git checkout -b nueva-rama');

    RAISE NOTICE 'Solución 1 completada: % registros insertados', (SELECT COUNT(*) FROM notas_demo);
END $$;

-- ================================================================
-- ✅ SOLUCIÓN 2: E-STRINGS CON ESCAPE SEQUENCES
-- ================================================================

-- Limpiar datos anteriores de forma segura
DELETE FROM notas_demo WHERE id IS NOT NULL;

INSERT INTO notas_demo (titulo, contenido) VALUES

('Ideas para el Proyecto', 
 E'Algunas mejoras que se podrían implementar:\\n- Categorías para organizar notas.\\n- Etiquetas\\n- Modo oscuro\\n- Exportar notas a PDF\\n- Búsqueda avanzada con filtros'),

('Lista de tareas', 
 E'Cosas por hacer:\\n- Revisar el código\\n- Escribir pruebas unitarias\\n- Optimizar las consultas a la base de datos\\n- Añadir validaciones del lado cliente\\n- Configurar CI/CD'),

('Notas de Arquitectura', 
 E'El proyecto sigue una arquitectura de 3 capas:\\n1. Frontend (React) - Interfaz de usuario\\n2. Backend (Express) - API REST\\n3. Base de Datos (PostgreSQL/Supabase) - Persistencia\\nEsta separación permite escalabilidad y mantenimiento eficiente.'),

('Comandos Útiles', 
 E'Comandos de Git más utilizados:\\ngit add .\\ngit commit -m "mensaje"\\ngit push origin main\\ngit pull origin main\\ngit branch\\ngit checkout -b nueva-rama');

-- ================================================================
-- ✅ SOLUCIÓN 3: MÚLTIPLES INSERTS SEPARADOS
-- ================================================================

DELETE FROM notas_demo; -- Limpiar para nueva demo

-- Insertar cada nota por separado (mejor para contenido muy complejo)
INSERT INTO notas_demo (titulo, contenido) VALUES 
('Bienvenido al Sistema de Notas', 'Esta es tu primera nota de ejemplo. Puedes crear, editar, buscar y eliminar notas fácilmente desde la interfaz web.');

INSERT INTO notas_demo (titulo, contenido) VALUES ('Ideas para el Proyecto', 'Algunas mejoras que se podrían implementar:');
INSERT INTO notas_demo (titulo, contenido) VALUES ('Idea 1', '- Categorías para organizar notas');
INSERT INTO notas_demo (titulo, contenido) VALUES ('Idea 2', '- Sistema de etiquetas');
INSERT INTO notas_demo (titulo, contenido) VALUES ('Idea 3', '- Modo oscuro para la interfaz');
INSERT INTO notas_demo (titulo, contenido) VALUES ('Idea 4', '- Exportar notas a PDF');
INSERT INTO notas_demo (titulo, contenido) VALUES ('Idea 5', '- Búsqueda avanzada con filtros');

INSERT INTO notas_demo (titulo, contenido) VALUES ('Lista de tareas', 'Cosas por hacer:');
INSERT INTO notas_demo (titulo, contenido) VALUES ('Tarea 1', '- Revisar el código');
INSERT INTO notas_demo (titulo, contenido) VALUES ('Tarea 2', '- Escribir pruebas unitarias');
INSERT INTO notas_demo (titulo, contenido) VALUES ('Tarea 3', '- Optimizar las consultas a la base de datos');
INSERT INTO notas_demo (titulo, contenido) VALUES ('Tarea 4', '- Añadir validaciones del lado cliente');
INSERT INTO notas_demo (titulo, contenido) VALUES ('Tarea 5', '- Configurar CI/CD');

-- ================================================================
-- ✅ SOLUCIÓN 4: USANDO VARIABLES EN BLOQUE DO
-- ================================================================

DELETE FROM notas_demo; -- Limpiar para nueva demo

DO $$
DECLARE
    contenido_bienvenida TEXT;
    contenido_ideas TEXT;
    contenido_tareas TEXT;
    contenido_arquitectura TEXT;
    contenido_comandos TEXT;
BEGIN
    -- Construir contenidos usando variables
    contenido_bienvenida := 'Esta es tu primera nota de ejemplo. ' ||
                           'Puedes crear, editar, buscar y eliminar notas ' ||
                           'fácilmente desde la interfaz web.';
    
    contenido_ideas := 'Algunas mejoras que se podrían implementar: ' ||
                      '- Categorías para organizar notas. ' ||
                      '- Etiquetas ' ||
                      '- Modo oscuro ' ||
                      '- Exportar notas a PDF ' ||
                      '- Búsqueda avanzada con filtros';
    
    contenido_tareas := 'Cosas por hacer: ' ||
                       '- Revisar el código ' ||
                       '- Escribir pruebas unitarias ' ||
                       '- Optimizar las consultas a la base de datos ' ||
                       '- Añadir validaciones del lado cliente ' ||
                       '- Configurar CI/CD';
    
    contenido_arquitectura := 'El proyecto sigue una arquitectura de 3 capas: ' ||
                             '1. Frontend (React) - Interfaz de usuario ' ||
                             '2. Backend (Express) - API REST ' ||
                             '3. Base de Datos (PostgreSQL/Supabase) - Persistencia ' ||
                             'Esta separación permite escalabilidad y mantenimiento eficiente.';
    
    contenido_comandos := 'Comandos de Git más utilizados: ' ||
                         'git add . ' ||
                         'git commit -m "mensaje" ' ||
                         'git push origin main ' ||
                         'git pull origin main ' ||
                         'git branch ' ||
                         'git checkout -b nueva-rama';
    
    -- Insertar usando las variables
    INSERT INTO notas_demo (titulo, contenido) VALUES
    ('Bienvenido al Sistema de Notas', contenido_bienvenida),
    ('Ideas para el Proyecto', contenido_ideas),
    ('Lista de tareas', contenido_tareas),
    ('Notas de Arquitectura', contenido_arquitectura),
    ('Comandos Útiles', contenido_comandos);
    
    RAISE NOTICE 'Se insertaron % notas correctamente', (SELECT COUNT(*) FROM notas_demo);
END $$;

-- ================================================================
-- ✅ SOLUCIÓN 5: FUNCIÓN HELPER PARA FORMATO
-- ================================================================

-- Crear función helper para formatear listas
CREATE OR REPLACE FUNCTION format_lista(titulo TEXT, items TEXT[])
RETURNS TEXT AS $$
DECLARE
    resultado TEXT;
    item TEXT;
BEGIN
    resultado := titulo || ': ';
    FOREACH item IN ARRAY items
    LOOP
        resultado := resultado || '- ' || item || ' ';
    END LOOP;
    RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- Usar la función helper
DELETE FROM notas_demo;

INSERT INTO notas_demo (titulo, contenido) VALUES
('Ideas Formateadas', 
 format_lista('Mejoras propuestas', 
              ARRAY['Categorías para organizar notas',
                    'Sistema de etiquetas',
                    'Modo oscuro',
                    'Exportar a PDF',
                    'Búsqueda avanzada'])),

('Tareas Formateadas', 
 format_lista('Por hacer',
              ARRAY['Revisar el código',
                    'Escribir pruebas unitarias',
                    'Optimizar consultas',
                    'Validaciones cliente',
                    'Configurar CI/CD']));

-- ================================================================
-- VERIFICACIÓN Y LIMPIEZA
-- ================================================================

-- Mostrar resultados
SELECT titulo, LEFT(contenido, 100) || '...' as contenido_preview
FROM notas_demo
ORDER BY id;

-- Limpiar tabla de demo
DROP TABLE IF EXISTS notas_demo;
DROP FUNCTION IF EXISTS format_lista(TEXT, TEXT[]);

-- ================================================================
-- RESUMEN DE REGLAS SONARQUBE
-- ================================================================

/*
REGLAS PARA EVITAR CARACTERES DE CONTROL:

1. NUNCA usar saltos de línea literales en strings SQL
   ❌ 'texto con
   salto literal'
   
2. USAR concatenación con ||
   ✅ 'texto con ' || 'continuación'
   
3. USAR E-strings para caracteres especiales
   ✅ E'texto con\\nsalto de línea'
   
4. CONSIDERAR múltiples INSERTs para datos complejos
   ✅ INSERT... VALUES ('parte1'); INSERT... VALUES ('parte2');
   
5. USAR variables en bloques DO para contenido dinámico
   ✅ DECLARE contenido TEXT := 'construido' || 'dinámicamente';

CARACTERES PROBLEMÁTICOS:
- Punto de código 10: Line Feed (LF) = \n
- Punto de código 13: Carriage Return (CR) = \r  
- Punto de código 9: Tab = \t (opcional según configuración)

EXCEPCIÓN: Los caracteres de tabulación pueden estar permitidos
según la configuración de SonarQube, pero se recomienda evitarlos
por consistencia.
*/
