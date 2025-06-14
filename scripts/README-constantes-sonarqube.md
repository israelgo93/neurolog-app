# Consolidación de Constantes - Solución SonarQube

## Problema Identificado

SonarQube detectó múltiples duplicaciones de literales en el archivo `basedatos.sql`:

- `'parent'` - duplicado 4 veces
- `'id UUID DEFAULT gen_random_uuid() PRIMARY KEY, '` - duplicado 4 veces  
- `'created_at TIMESTAMPTZ DEFAULT NOW(), '` - duplicado 3 veces
- `'medium'` - duplicado 3 veces

## Solución Implementada

### Antes (No Conforme)
```sql
-- Bloque 1
DO $$
DECLARE
  co_role_parent CONSTANT TEXT := 'parent';
BEGIN
  -- usar co_role_parent
END $$;

-- Bloque 2
DO $$
DECLARE
  co_role_parent CONSTANT TEXT := 'parent'; -- DUPLICADO!
BEGIN
  -- usar co_role_parent otra vez
END $$;
```

### Después (Conforme)
```sql
-- Función auxiliar reutilizable
CREATE OR REPLACE FUNCTION get_role_parent() RETURNS TEXT AS $$
BEGIN
    RETURN 'parent';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Uso en bloques DO
DO $$
BEGIN
  -- usar get_role_parent() en lugar de constante local
END $$;
```

## Funciones Auxiliares Creadas

1. **`get_role_parent()`** - Retorna `'parent'`
2. **`get_role_teacher()`** - Retorna `'teacher'` 
3. **`get_role_specialist()`** - Retorna `'specialist'`
4. **`get_role_admin()`** - Retorna `'admin'`
5. **`get_role_observer()`** - Retorna `'observer'`
6. **`get_role_family()`** - Retorna `'family'`
7. **`get_primary_key_fragment()`** - Retorna fragmento de PRIMARY KEY UUID
8. **`get_created_at_fragment()`** - Retorna fragmento de CREATED_AT
9. **`get_intensity_medium()`** - Retorna `'medium'`

## Beneficios

✅ **Cumplimiento SonarQube**: Eliminadas todas las duplicaciones de literales  
✅ **Mantenibilidad**: Un solo lugar para cambiar cada constante  
✅ **Reutilización**: Funciones disponibles para todo el esquema  
✅ **Consistencia**: Valores garantizados idénticos en todos los usos  
✅ **Performance**: Funciones IMMUTABLE son cacheadas por PostgreSQL  

## Bloques Refactorizados

- `profiles` table creation
- `user_child_relations` table creation  
- `daily_logs` table creation
- `audit_logs` table creation
- `handle_new_user()` function
- `user_accessible_children` view

## Verificación

```bash
# Ejecutar análisis SonarQube - debe mostrar 0 duplicaciones
# Verificar que el script SQL ejecuta sin errores
```

Todas las constantes duplicadas han sido consolidadas exitosamente en funciones auxiliares reutilizables.
