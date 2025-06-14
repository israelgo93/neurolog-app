# Configuración de Badges SonarCloud

## Instrucciones para Configurar los Badges

### 1. Obtener tu Project Key
1. Ve a tu proyecto en [SonarCloud](https://sonarcloud.io)
2. En la página principal del proyecto, copia el **Project Key**
3. Normalmente tiene el formato: `tu-usuario_neurolog-app`

### 2. Reemplazar en README.md
En el archivo `README.md`, reemplaza **TODAS** las ocurrencias de `TU_PROJECT_KEY` con tu Project Key real.

**Ejemplo:**
```markdown
# Si tu Project Key es: juan_neurolog-app

# ANTES (template):
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=TU_PROJECT_KEY&metric=alert_status)]

# DESPUÉS (configurado):
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=juan_neurolog-app&metric=alert_status)]
```

### 3. Badges Incluidos

Los siguientes badges están configurados en tu README:

#### **Métricas Principales:**
- **Quality Gate Status** - Estado general del proyecto
- **Maintainability Rating** - Rating de mantenibilidad (A-E)
- **Security Rating** - Rating de seguridad (A-E) 
- **Reliability Rating** - Rating de fiabilidad (A-E)

#### **Contadores de Issues:**
- **Bugs** - Número total de bugs
- **Code Smells** - Número de code smells
- **Vulnerabilities** - Número de vulnerabilidades
- **Security Hotspots** - Número de security hotspots

#### **Métricas Adicionales:**
- **Technical Debt** - Tiempo estimado para resolver issues
- **Coverage** - Porcentaje de cobertura de tests
- **Duplicated Lines** - Porcentaje de líneas duplicadas
- **Lines of Code** - Total de líneas de código

### 4. Ejemplo de Reemplazo Completo

```bash
# Comando para reemplazar automáticamente (Linux/Mac):
sed -i 's/TU_PROJECT_KEY/tu-project-key-real/g' README.md

# En Windows (PowerShell):
(Get-Content README.md) -replace 'TU_PROJECT_KEY', 'tu-project-key-real' | Set-Content README.md
```

### 5. Verificar que Funcionen

Después de reemplazar el Project Key:
1. Guarda el archivo README.md
2. Haz commit y push a GitHub
3. Ve a tu repositorio en GitHub
4. Los badges deberían mostrar métricas reales de SonarCloud

### 6. Solución de Problemas

**Si los badges no aparecen:**
- Verifica que el Project Key sea correcto
- Asegúrate de que el proyecto sea público en SonarCloud
- Espera unos minutos para que se actualicen las métricas
- Verifica que el análisis de SonarCloud se haya completado

**Project Key común:**
- Formato típico: `organization_repository-name`
- Ejemplo: `usuario123_neurolog-app`
- Puedes verlo en la URL de SonarCloud: `/project/overview?id=TU_PROJECT_KEY`

### 7. Personalización Adicional

Si quieres personalizar los badges:
- Cambia el orden en el README.md
- Elimina badges que no necesites
- Agrega badges adicionales desde SonarCloud > Information > Get project badges

### 8. Resultado Final

Una vez configurado correctamente, tu README mostrará algo como:

```
Quality Gate: PASSED
Maintainability: A  
Security: A
Reliability: A
Bugs: 0
Code Smells: 16
```

¡Esto demostrará la excelente calidad de tu código refactorizado! 🎉
