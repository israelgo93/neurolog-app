# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
Es importante que siempre respondas en español. Todas tus respuestas deben ser en español.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production version  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript compiler checks
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing Commands
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ci` - Run tests in CI mode

### Database Setup
Execute the SQL script from `scripts/basedatos.txt` in Supabase SQL Editor to create the complete database schema.

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15+ with App Router and TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **UI**: Tailwind CSS + Shadcn/UI components (Radix-based)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for data visualization
- **File Export**: jsPDF for PDF generation, PapaParse for CSV

### Key Architecture Patterns

#### Authentication & Authorization
- `AuthProvider` (`src/components/providers/AuthProvider.tsx`) manages global auth state
- `useAuth` hook (`src/hooks/use-Auth.ts`) provides auth functionality with memory caching
- Middleware (`src/middleware.ts`) protects dashboard routes and handles redirects
- Row Level Security (RLS) enforced at database level for all data access

#### Data Layer
- Custom hooks in `src/hooks/` encapsulate all Supabase operations
- `src/lib/supabase.ts` provides Supabase client configuration and helper functions
- Database functions and RLS policies handle permissions server-side
- Real-time subscriptions for live data updates

#### Permission System
- Role-based access: `parent`, `teacher`, `specialist`, `admin`
- `user_child_relations` table manages which users can access specific children
- Helper functions `userCanAccessChild()` and `userCanEditChild()` verify permissions
- Audit logging for sensitive operations

### Directory Structure

#### Core Directories
- `src/app/` - Next.js App Router pages and layouts
  - `auth/` - Authentication pages (login/register)
  - `dashboard/` - Protected application routes
- `src/components/` - React components organized by feature
  - `ui/` - Generic Shadcn/UI components
  - `children/`, `logs/`, `reports/` - Feature-specific components
- `src/hooks/` - Custom React hooks for business logic
- `src/lib/` - Utilities and configuration
- `src/types/` - TypeScript type definitions

#### Database Schema
Key tables managed via `scripts/basedatos.txt`:
- `profiles` - User information extending auth.users
- `children` - Child profiles being monitored
- `daily_logs` - All daily entries with categories
- `user_child_relations` - Permission mapping
- `categories` - Predefined log categories
- `audit_logs` - Security audit trail

### Development Guidelines

#### Environment Setup
Required `.env.local` variables:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key
```

#### Component Patterns
- Form components use React Hook Form with Zod schemas
- Dialog components follow Shadcn/UI patterns with proper state management
- Custom hooks handle all data fetching and mutations
- TypeScript strict mode enforced throughout

#### Security Considerations
- Never expose service role key in client code
- All database access goes through RLS policies
- Sensitive operations logged via `auditSensitiveAccess()`
- File uploads restricted to authenticated users with proper permissions

#### Testing Strategy
- Jest configured for unit testing
- Test files in `__tests__` directories alongside components
- Coverage reports available via `npm run test:coverage`

### Common Development Patterns

When adding new features:
1. Define TypeScript types in `src/types/`
2. Create custom hooks for data operations in `src/hooks/`
3. Build UI components following existing patterns
4. Update database schema via new SQL scripts
5. Add appropriate RLS policies for data security
6. Test with `npm run type-check` and `npm run lint`

For database changes:
1. Modify `scripts/basedatos.txt` with new schema
2. Test locally in Supabase SQL Editor
3. Update TypeScript types to match schema
4. Add corresponding custom hooks for new data operations