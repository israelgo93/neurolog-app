# GEMINI Project Analysis: NeuroLog

## 1. Project Overview

**NeuroLog** is an open-source web application designed for the daily logging and tracking of behaviors, emotions, and progress of children with special educational needs (NEE). The platform aims to facilitate collaboration between parents, teachers, and clinical professionals by providing a centralized, secure, and structured system for information sharing.

### Core Features:
- **User Authentication:** Secure login and registration for different user roles.
- **Role-Based Access Control:** Differentiated permissions for parents, teachers, and specialists.
- **Child Profile Management:** Create and manage profiles for one or more children.
- **Daily Logging:** Record daily events across predefined categories like emotions, behavior, learning, and socialization.
- **Data Visualization:** Interactive charts and graphs to visualize trends, patterns, and progress over time.
- **Reporting & Export:** Generate and export reports in formats like CSV or PDF.
- **Real-time Collaboration:** Utilizes Supabase Realtime for live updates.
- **Secure File Storage:** Manages avatars and log attachments using Supabase Storage.

## 2. Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 15+ (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Library:** [React](https://react.dev/) 18+
- **Backend & Database:** [Supabase](https://supabase.com/)
  - **Database:** PostgreSQL
  - **Authentication:** Supabase Auth
  - **Storage:** Supabase Storage for files.
  - **Real-time:** Supabase Realtime for live data synchronization.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn/UI](https://ui.shadcn.com/) built on top of Radix UI.
- **Forms:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for schema validation.
- **Data Visualization:** [Recharts](https://recharts.org/)
- **Linting & Formatting:** ESLint and Prettier.
- **Package Manager:** npm

## 3. Project Structure

The project follows a feature-oriented structure within the `src` directory, which is standard for modern Next.js applications.

```
neurolog-app/
├── scripts/
│   └── basedatos.txt      # Full SQL schema for the Supabase database.
├── src/
│   ├── app/               # Next.js App Router: pages and layouts.
│   │   ├── (auth)/        # Authentication routes (login, register).
│   │   └── (dashboard)/   # Protected application routes.
│   ├── components/        # Reusable React components.
│   │   ├── ui/            # Generic UI elements from Shadcn/UI.
│   │   ├── layout/        # Layout components (Header, Sidebar).
│   │   └── children/      # Feature-specific components.
│   ├── hooks/             # Custom React hooks for business logic.
│   ├── lib/               # Core utilities and Supabase client configuration.
│   └── types/             # Global TypeScript type definitions.
├── public/                # Static assets.
├── package.json           # Project dependencies and scripts.
└── next.config.js         # Next.js configuration.
```

## 4. Database Schema

The complete database schema is defined in `scripts/basedatos.txt`. It includes table definitions, indexes, Row Level Security (RLS) policies, and PostgreSQL functions.

### Key Tables:
- `profiles`: Stores user information and roles, extending `auth.users`.
- `children`: Contains the profiles of the children being monitored.
- `daily_logs`: The central table for all daily entries, linked to a child and a category.
- `categories`: Pre-defined categories for logs (e.g., 'Behavior', 'Emotions').
- `user_child_relations`: A junction table managing permissions between users and children (e.g., a teacher can view logs for a specific child).
- `audit_logs`: Logs sensitive actions for security and auditing purposes.

Row Level Security (RLS) is extensively used to ensure users can only access data they are permitted to see. For example, a user can only view logs for children they are explicitly linked to in the `user_child_relations` table.

## 5. Core Logic & Data Flow

### Authentication
1.  The UI for login/register is in `src/app/auth/`.
2.  The `AuthProvider` (`src/components/providers/AuthProvider.tsx`) wraps the application, managing the user's session state.
3.  The `useAuth` hook (`src/hooks/use-Auth.ts`) provides access to the current user and session throughout the app.
4.  The `middleware.ts` file protects the `/dashboard` routes, redirecting unauthenticated users to the login page.

### Data Fetching and Mutation
-   Custom hooks in `src/hooks/` (e.g., `use-children.ts`, `use-logs.ts`) encapsulate the logic for interacting with the Supabase database.
-   These hooks handle fetching data, creating new records, updating existing ones, and deleting them.
-   They use the Supabase client configured in `src/lib/supabase.ts`.
-   This pattern centralizes data logic, making components cleaner and more focused on presentation.

### State Management
-   Primarily uses a combination of React's built-in state (`useState`, `useReducer`) and context (`useContext`) for global state like authentication.
-   For server state (data fetched from Supabase), the custom hooks act as a data-fetching layer, often re-fetching data after mutations to keep the UI in sync.

## 6. How to Run the Project

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Set up Supabase:**
    - Create a project on [supabase.com](https://supabase.com).
    - Run the SQL script from `scripts/basedatos.txt` in the Supabase SQL Editor to create the database schema.
3.  **Configure Environment Variables:**
    - Create a `.env.local` file in the project root.
    - Add your Supabase URL and anon key:
      ```env
      NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
      ```
4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
The application will be available at `http://localhost:3000`.
