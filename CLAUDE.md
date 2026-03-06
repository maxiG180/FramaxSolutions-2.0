# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment
- OS: Windows with Git Bash
- Always use bash syntax, never Windows CMD syntax
- Use forward slashes in paths
- Use `grep`, `find`, `ls` — not Windows CMD equivalents

## Development Commands

```bash
# Development
npm run dev              # Start dev server (usually port 3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Supabase (if configured locally)
npx supabase db push     # Push schema changes
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + Google OAuth
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State**: Zustand (chatbot state)
- **i18n**: Custom implementation with `LanguageContext`

### Project Structure

**Three Main Areas:**
1. **Landing Page** (`src/app/page.tsx`): Public marketing site with dynamic imports
2. **Dashboard** (`src/app/dashboard/**`): Authenticated CRM/admin area (Portuguese only)
3. **Client Portal** (`src/app/portal/**`): Client-facing project view

**Key Directories:**
- `src/app/`: Next.js 15 App Router pages and API routes
- `src/components/`: Reusable React components
  - `sections/`: Landing page sections (Hero, Features, Portfolio, etc.)
  - `dashboard/`: Dashboard-specific components (Sidebar, modals, etc.)
  - `ui/`: Shared UI components (CookieConsent, DiscountOffer, etc.)
  - `chatbot/`: Chatbot widget components
- `src/lib/`: Utilities and shared logic
  - `chatbot/`: Chatbot state (Zustand) and flow logic
  - `google-calendar.ts`: Google Calendar API integration
- `src/utils/supabase/`: Supabase client creation utilities
- `src/context/`: React Context providers
- `src/locales/`: i18n translation files (`en.ts`, `pt.ts`)
- `supabase/`: Database schema and migrations

### Critical Architecture Patterns

#### 1. Internationalization (i18n)
- Implemented via `LanguageContext.tsx` with `en.ts` and `pt.ts` translation files
- **Landing page**: User can switch between English/Portuguese
- **Dashboard**: Forced to Portuguese (see `LanguageContext.tsx:36-40`)
- All components use `const { t } = useLanguage()` hook
- Translation objects are strongly typed via `Translation` type in `src/locales/types.ts`

#### 2. Authentication & Authorization
- Supabase Auth handles user authentication
- Google OAuth implemented via `src/app/api/auth/google/callback/route.ts`
- Dashboard routes should check authentication status
- RLS (Row Level Security) policies enforce data access in Supabase

#### 3. Dynamic Imports for Performance
The landing page (`src/app/page.tsx`) uses aggressive code splitting:
```tsx
const Hero = dynamic(() => import('@/components/Hero'));
const Features = dynamic(() => import('@/components/sections/Features'), {
  loading: () => <div className="min-h-[400px] animate-pulse bg-white/5" />
});
```

#### 4. Chatbot System
- **State**: Zustand store in `src/lib/chatbot/store.ts` with localStorage persistence
- **Flow Logic**: Intent matching in `src/lib/chatbot/flows.ts`
- **Multilingual**: Resolves answers based on current language via `intentKey`
- **Tracking**: Logs interactions to `chatbot_interactions` Supabase table

#### 5. API Routes
Located in `src/app/api/`:
- **External integrations**: `/book-meeting`, `/calendar`, `/auth/google/callback`
- **Database operations**: `/quotes`, `/invoices`, `/payments`, `/services`
- **Utilities**: `/generate-pdf-from-html`, `/send-quote-email`
- **Webhooks**: `/cron/send-discord-alerts`

### Database Schema

Key tables (see `supabase/schema.sql` and migrations):
- `profiles`: User profiles (linked to auth.users)
- `clients`: Client information with NIF, language preference
- `projects`: Project management
- `quotes` / `invoices`: Financial documents with line items
- `payments`: Payment tracking
- `services`: Service catalog with inclusions
- `tasks` / `notes` / `calendar_events`: Productivity features
- `qr_codes` / `qr_scans`: QR code management and analytics
- `chatbot_interactions`: Chatbot conversation logging

### Environment Variables

Required variables (see `.env.example`):
```
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY         # Service role key (server-side only)
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET  # OAuth credentials
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY   # Google Maps (client-safe)
RESEND_API_KEY                    # Email service
BOOKING_WEBHOOK_URL               # n8n webhook (NEVER use NEXT_PUBLIC_)
CRON_SECRET                       # Cron job authentication
```

**Security**: Never prefix sensitive URLs/secrets with `NEXT_PUBLIC_` (exposed in client bundle).

## SEO — Regras Obrigatórias

SEO é uma prioridade crítica neste projeto. Sempre que criar ou modificar código, seguir estas regras sem excepções.

### Metadata API (Next.js 15)
- NUNCA usar o componente `<Head>` do Next.js antigo
- Usar SEMPRE `export const metadata` (estático) ou `generateMetadata()` (dinâmico)
- Cada página (`page.tsx`) deve ter `title` e `description` definidos

```tsx
// Estático
export const metadata: Metadata = {
  title: 'Título da Página | Framax Solutions',
  description: 'Descrição clara com 150-160 caracteres.',
};

// Dinâmico (ex: página de projeto)
export async function generateMetadata({ params }): Promise<Metadata> {
  const project = await getProject(params.id);
  return {
    title: `${project.name} | Framax Solutions`,
    description: project.description,
  };
}
```

### Open Graph & Social
- Todas as páginas públicas devem ter tags Open Graph (`og:title`, `og:description`, `og:image`)
- Usar `/public/og-image.png` (1200×630px) como imagem default
- Páginas de portfólio/projeto devem ter OG dinâmico com imagem própria

```tsx
openGraph: {
  title: '...',
  description: '...',
  images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  locale: 'pt_PT',
  type: 'website',
},
```

### Internacionalização & SEO
- Páginas com conteúdo em pt/en devem ter `hreflang` correcto no metadata
- O `locale` no Open Graph deve reflectir o idioma da página: `pt_PT` ou `en_US`
- Nunca servir o mesmo conteúdo em dois URLs sem canonical definido

### Estrutura Semântica de HTML
- Cada página deve ter EXACTAMENTE um `<h1>` visível
- Hierarquia de headings obrigatória: `h1` → `h2` → `h3` (nunca saltar níveis)
- Usar elementos semânticos: `<main>`, `<section>`, `<article>`, `<nav>`, `<footer>`
- Imagens: atributo `alt` sempre preenchido de forma descritiva (nunca vazio em imagens de conteúdo)
- Links: texto âncora descritivo — NUNCA "clique aqui" ou "saiba mais" sem contexto

### Performance (Core Web Vitals)
- Imagens: usar SEMPRE `next/image` com `width`, `height` e `priority` no hero
- Fontes: carregar via `next/font` (nunca `@import` em CSS)
- Componentes pesados: usar `dynamic()` com `ssr: false` se não precisam de indexação
- Evitar Cumulative Layout Shift (CLS): definir dimensões explícitas em imagens e embeds

### URLs & Navegação
- URLs em lowercase com hífens: `/servicos/desenvolvimento-web` ✓
- Canonical tags em páginas com conteúdo duplicado ou parametrizado
- Dashboard (`/dashboard/**`) e Portal (`/portal/**`) devem ter `noindex`:

```tsx
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
```

### Sitemap & Robots
- `src/app/sitemap.ts`: incluir todas as páginas públicas com `lastModified`
- `src/app/robots.ts`: bloquear `/dashboard/`, `/portal/`, `/api/`
- Não remover nem modificar estes ficheiros sem razão explícita

### O que NUNCA fazer
- Não usar `display: none` ou `visibility: hidden` para esconder conteúdo de utilizadores mas deixá-lo visível para crawlers — é penalização de keyword stuffing
- Não renderizar texto importante só via JavaScript sem fallback estático
- Não criar páginas sem metadata definida
- Não ignorar alt text em imagens — usar `alt=""` apenas em imagens puramente decorativas sem significado

## Performance Considerations

### Known Issue: Excessive Framer Motion Usage
The landing page has **142+ `motion.div` components** causing performance degradation:
- **Hero.tsx**: 40 motion components (590 lines) - primary bottleneck
- **Features.tsx**: 20 motion components
- **MobileSEOPlacement.tsx**: 24 motion components
- **Booking.tsx**: 19 motion components

**When optimizing**:
1. Reduce motion components to essential animations only
2. Replace `motion.div` with CSS animations where possible
3. Use `whileInView` with `once: true` to prevent re-animations
4. Consider lazy-loading heavy animation components

### CSS Performance
- **Avoid `backdrop-filter`**: Previously caused 19+ elements with constant GPU compositing
- Use semi-opaque backgrounds (`bg-black/90`) instead of `backdrop-blur`
- For small decorative elements, use CSS animations over JavaScript

### Easter Egg Effects
- Mouse event listeners (sparkle trail, confetti) MUST be throttled to 16ms or use `requestAnimationFrame`
- Always clean up DOM elements after animations complete — never leave particles in the DOM
- Test interactive effects in Chrome (not just the Cursor built-in browser) before committing

## Code Style & Conventions

- **Component naming**: PascalCase (e.g., `Hero.tsx`, `QuoteModal.tsx`)
- **Utility functions**: camelCase (e.g., `createClient.ts`)
- **Imports**: Use `@/` alias for absolute imports from `src/`
- **Styling**: Tailwind utility classes, avoid inline styles except for dynamic values
- **TypeScript**: Strict mode enabled, use typed props and state

## Common Workflows

### Adding a New Translation
1. Update `src/locales/en.ts` and `src/locales/pt.ts`
2. Update type definitions in `src/locales/types.ts`
3. Use in components via `const { t } = useLanguage()`

### Adding a Database Table
1. Create migration in `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
2. Define table structure with RLS policies
3. Push changes: `npx supabase db push`
4. Update TypeScript types if needed

### Creating a New API Route
1. Create file in `src/app/api/your-route/route.ts`
2. Export named HTTP method handlers: `GET`, `POST`, `PUT`, `DELETE`
3. Use `createClient()` from `@/utils/supabase/client` for database access
4. Return `NextResponse.json()` for responses

### Optimizing a Heavy Component
1. Check motion component count: `grep -c "motion\." ComponentName.tsx`
2. Replace non-essential motion components with regular divs
3. Use CSS animations (`@keyframes` in Tailwind config) for simple effects
4. Add `loading` states to dynamic imports in `page.tsx`

## Build & Deployment

- **Vercel**: Optimized for Vercel deployment
- **Build**: `npm run build` compiles to `.next/` directory
- **Bundle size**: Monitor First Load JS per route in build output
- **Environment**: Ensure all required env vars are set in hosting platform