-- ================================================================
-- SCRIPT DE DEMOSTRACIÓN: CORRECCIÓN DE CARACTERES DE CONTROL
-- ================================================================
-- Ejecutar este script para demostrar las correcciones

-- Constantes para métodos de corrección
DO $$
DECLARE
    co_concatenacion CONSTANT TEXT := 'Concatenación con ||';
    co_estrings CONSTANT TEXT := 'E-strings con escape';
    co_variables CONSTANT TEXT := 'Variables en bloque DO';
BEGIN

-- 1. Crear tabla de ejemplo
CREATE TABLE IF NOT EXISTS notas_demo (
    id SERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    metodo_correccion TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Limpiar datos anteriores
TRUNCATE TABLE notas_demo;

-- 3. DEMOSTRACIÓN: INSERT correcto con concatenación
INSERT INTO notas_demo (titulo, contenido, metodo_correccion) VALUES
('Bienvenida al Sistema', 
 'Esta es tu primera nota de ejemplo. ' ||
 'Puedes crear, editar, buscar y eliminar notas ' ||
 'fácilmente desde la interfaz web.',
 co_concatenacion),

('Ideas para Mejoras', 
 'Algunas mejoras que se podrían implementar: ' ||
 '• Categorías para organizar notas ' ||
 '• Sistema de etiquetas ' ||
 '• Modo oscuro para la interfaz ' ||
 '• Exportar notas a PDF ' ||
 '• Búsqueda avanzada con filtros',
 co_concatenacion),

('Lista de Tareas', 
 'Tareas pendientes del proyecto: ' ||
 '• Revisar y refactorizar el código ' ||
 '• Escribir pruebas unitarias completas ' ||
 '• Optimizar consultas de base de datos ' ||
 '• Añadir validaciones del lado cliente ' ||
 '• Configurar pipeline de CI/CD',
 co_concatenacion);

-- 4. DEMOSTRACIÓN: INSERT con E-strings
INSERT INTO notas_demo (titulo, contenido, metodo_correccion) VALUES
('Arquitectura del Sistema', 
 E'El proyecto sigue una arquitectura de 3 capas:\\n• Capa de presentación (Frontend)\\n• Capa de lógica de negocio (Backend)\\n• Capa de datos (Base de datos)',
 co_estrings),

('Configuración del Proyecto',
 E'Pasos para configurar el entorno:\\n• Instalar Node.js y npm\\n• Clonar el repositorio\\n• Ejecutar npm install\\n• Configurar variables de entorno\\n• Ejecutar npm run dev',
 co_estrings);

-- 5. DEMOSTRACIÓN: INSERT usando variables (continuación del bloque)
    -- Variables para contenido complejo
    DECLARE
        contenido_seguridad TEXT;
        contenido_performance TEXT;
    BEGIN
        contenido_seguridad := 'Consideraciones de seguridad importantes: ' ||
                              '• Autenticación y autorización robusta ' ||
                              '• Validación de entrada en servidor y cliente ' ||
                              '• Protección contra inyección SQL ' ||
                              '• Sanitización de datos de usuario ' ||
                              '• Implementación de HTTPS en producción';
        
        contenido_performance := 'Optimizaciones de rendimiento aplicadas: ' ||
                                '• Índices en columnas de búsqueda frecuente ' ||
                                '• Paginación para listados largos ' ||
                                '• Caching de consultas comunes ' ||
                                '• Compresión de respuestas HTTP ' ||
                                '• Lazy loading de componentes React';
        
        INSERT INTO notas_demo (titulo, contenido, metodo_correccion) VALUES
        ('Notas de Seguridad', contenido_seguridad, co_variables),
        ('Optimizaciones de Performance', contenido_performance, co_variables);
    END;

END $$;

-- 6. Mostrar resultados
SELECT 
    id,
    titulo,
    LEFT(contenido, 100) || '...' as contenido_preview,
    metodo_correccion,
    created_at
FROM notas_demo 
ORDER BY id ASC;

-- 7. Estadísticas
SELECT 
    metodo_correccion,
    COUNT(*) as cantidad_notas,
    AVG(LENGTH(contenido)) as longitud_promedio
FROM notas_demo 
GROUP BY metodo_correccion
ORDER BY cantidad_notas DESC;

-- 8. Mensaje final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ DEMOSTRACIÓN COMPLETADA';
    RAISE NOTICE '';
    RAISE NOTICE 'Se insertaron % notas usando métodos conformes a SonarQube:', 
                 (SELECT COUNT(*) FROM notas_demo);
    RAISE NOTICE '';
    RAISE NOTICE 'Métodos utilizados:';
    RAISE NOTICE '• Concatenación con || (Recomendado)';
    RAISE NOTICE '• E-strings con escape sequences';  
    RAISE NOTICE '• Variables en bloques DO para casos complejos';
    RAISE NOTICE '';
    RAISE NOTICE '❌ EVITAR: Saltos de línea literales en strings SQL';
    RAISE NOTICE '✅ USAR: Concatenación, escape sequences o variables';
    RAISE NOTICE '';
END $$;

-- Cleanup opcional (comentado para mantener los datos de ejemplo)
-- DROP TABLE IF EXISTS notas_demo;
