# NeuroLog - Registro Diario para Niños con NEE

## 📋 Descripción

NeuroLog es una aplicación web **open source** orientada al registro y seguimiento diario de comportamientos, emociones y avances de niños con necesidades educativas especiales (NEE). 

La aplicación facilita la colaboración entre padres, docentes y profesionales clínicos, centralizando la información de forma estructurada, segura y accesible mediante un sistema de roles diferenciados.

### ✨ Características principales:
- Registro diario de eventos categorizados (emociones, conductas, alimentación, atención, socialización)
- Visualización de patrones y tendencias con gráficos
- Sistema de roles para padres, docentes y especialistas
- Exportación de reportes en CSV/PDF
- Notificaciones y recordatorios automáticos
- Seguridad y privacidad de datos

## 🛠 Tecnologías

- **Frontend:** Next.js/React
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Autenticación:** Supabase Auth
- **Tiempo real:** Supabase Realtime
- **Gráficos:** Chart.js/Recharts

## 📋 Requisitos del Sistema

- **Node.js:** v18.0.0 o superior
- **npm:** v8.0.0 o superior
- **Cuenta Supabase:** Gratuita

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/israelgo93/neurolog-app.git
cd neurolog-app
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Supabase

#### Crear proyecto en Supabase:
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto
3. Anota la **URL** y **anon key** de tu proyecto (Settings > API)

#### Configurar base de datos:
1. Ve a SQL Editor en tu dashboard de Supabase
2. Ejecuta el script ubicado en `scripts/basedatos.sql`
3. Verifica que las tablas se hayan creado correctamente

### 4. Variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
SUPABASE_SERVICE_ROLE_KEY=key-service-rol
```

### 5. Ejecutar la aplicación
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📊 Configuración de Supabase

### Habilitar Row Level Security (RLS):
1. Ve a Authentication > Policies en tu dashboard
2. Habilita RLS para las tablas principales
3. Las políticas de seguridad se configuran automáticamente con el script SQL

### Configurar autenticación:
1. Ve a Authentication > Settings
2. Configura los providers de autenticación deseados (Email, Google, etc.)
3. Ajusta las URLs de redirección según tu dominio

## 🔑 Estructura del Proyecto

```
neurolog-app/
├── scripts/
│   └── basedatos.sql      # Script de creación de BD
├── src/
│   ├── components/        # Componentes React
│   ├── pages/            # Páginas Next.js
│   ├── lib/              # Configuración Supabase
│   └── styles/           # Estilos CSS
├── .env.local            # Variables de entorno
└── README.md
```

## 🤝 Contribuir

NeuroLog es un proyecto open source. Las contribuciones son bienvenidas:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📝 Licencia

Este proyecto está bajo licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:
- Abre un [issue](https://github.com/israelgo93/neurolog-app/issues) en GitHub
- Revisa la documentación en la carpeta `docs/`

---

**Nota:** NeuroLog está diseñado para complementar, no reemplazar, la evaluación profesional especializada.

**Nota:** Hola