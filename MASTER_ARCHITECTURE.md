# Master Architecture — Project One Solution

## Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Runtime:** React 19, Node.js
- **Backend:** Supabase (Auth, DB, Realtime, Storage)
- **Server State:** TanStack Query v5
- **Client State:** Zustand
- **Styling:** Tailwind CSS v4, dark mode
- **Animations:** Framer Motion (spring: stiffness 350, damping 28)
- **Notifications:** Sonner
- **Icons:** Lucide React

## Directory Structure
```
app/                    # Next.js App Router pages
  /(auth)/             # Auth routes (login, reset-password, etc.)
  /blog/               # Blog system
  /community/          # Community feed, forums, Q&A
  /dashboard/          # Seller dashboard
  /events/             # Events & expos
  /marketplace/        # Product marketplace feeds
  /organizations/      # Organization pages
  /rfq/                # Request for quotes
  /suppliers/          # Supplier discovery
components/
  /common/             # Shared: Navbar, Avatar, NotificationBell
  /data-display/       # ProgressRing, charts
  /marketplace/        # ProductCard, DealCardMetrics, RankingBadge, etc.
  /trust/              # TrustBadge, TrustScore, TrustBar
  /ui/                 # Button, Container, Skeleton, EmptyState primitives
lib/
  /hooks/              # useFeed, usePostTracking, useIntersection
  /marketplace/       # feedMath, uiPhysics
  /physics/           # engine.js (centralized spring configs, presets)
  /queries/           # TanStack Query v5 hooks (rfqQueries.js — Phase 4)
  /realtime/          # supabaseRealtime
  /store/              # Zustand store
  /supabase/           # Client, server, middleware helpers
  /trust/              # trustCalculator
  /utils/              # Formatters, helpers
services/              # API/service layer (productService, rfqService, etc.)
providers/             # ThemeProvider, QueryProvider
middleware.js          # Auth guard + security headers
```

## Key Patterns
- `'use client'` on all interactive pages (no RSC separation yet)
- Spring config: `{ type: 'spring', stiffness: 350, damping: 28 }`
- Container component for consistent max-width/padding
- `motion.div` wrappers for physics hover effects
- Supabase auth session in `useEffect` with cleanup
- Debounced search inputs (300ms)
- Infinite scroll via Intersection Observer

## Architecture Intelligence
- `architecture-graphs/` — Dependency, coupling, hotspots, monolith, feature boundary reports
- Graph analysis on: app/, components/, services/, lib/, providers/, middleware.js

## Data Flow
1. Page components fetch via Supabase client directly
2. TanStack Query available but underutilized (should be primary)
3. Zustand for UI state (modals, sidebar)
4. Realtime via Supabase channels with reconnection logic

## Procurement Transaction System
- **Buyer**: Create RFQ → View Quotes → Shortlist/Reject/Award
- **Supplier**: Browse RFQs → Submit Quote → Track Status
- Service: `services/rfqService.js` (quote functions)
- Schema: `SUPABASE_SCHEMA.md` (quotes table, RLS policies)

## Known Issues
- ~~Feed system fragmented~~ → Consolidated: lib/feed/feedClient.js exports normalizeFeedItem, normalizeFeedResponse (2026-05-09)
- All pages 'use client' (no RSC separation)
- 15 files > 500 lines (architecture hotspots)
