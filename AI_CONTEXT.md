# AI Context — For Claude Code Continuity

## Project Vision
Billion-dollar-scale B2B ecosystem: Alibaba + IndiaMART + Stripe + Linear + LinkedIn + Discord + Bloomberg Terminal.

## Active Constraints
- **Phase 2 ONLY:** UI improvements — NO architecture restructuring, NO new major systems
- Keep all physics animations (spring stiffness 350, damping 28)
- Test build after every batch (`npm run build`)
- Preserve existing functionality — don't break working systems

## Priority UI Tasks (Phase 2)
1. ~~Marketplace cards~~ ✓
2. ~~Supplier pages~~ ✓
3. ~~Trust badge system~~ ✓
4. RFQ pages
5. Dashboard usability
6. Mobile responsiveness
7. Navigation clarity
8. Loading states
9. Visual hierarchy
10. Premium B2B feel

## Build Status
- **Current:** Passing ✓
- All 39 routes compile successfully
- Middleware deprecated warning (can rename to `proxy` later)

## Critical Issues (Not Yet Fixed)
- `components/blog/post-preview.js:36` — XSS via dangerouslySetInnerHTML
- `app/auth/callback/route.js:16` — Open redirect vulnerability

## Conventions
- Import `springConfig`, `staggerDelay` from `@/lib/physics/engine`
- Supabase auth pattern: `useEffect` → `supabase.auth.getSession()` → cleanup subscription
- Debounce search: `setTimeout(..., 300)`
- Infinite scroll: `useInView` from `react-intersection-observer`

## Standardized UI Components
- `components/ui/Skeleton.js`: CardSkeleton, CardGridSkeleton, ListSkeleton, StatSkeleton, StatsGridSkeleton
- `components/ui/EmptyState.js`: EmptyState, NoProductsEmpty, NoSuppliersEmpty, NoRFQsEmpty, NoSearchResults

## Mobile Strategy
- Grid breakpoints: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` for cards
- Gap scaling: `gap-3 sm:gap-4 lg:gap-6` for responsive spacing
- Typography: `text-2xl sm:text-3xl md:text-4xl` for hero headings
- Buttons: `px-4 sm:px-6 py-2.5 sm:py-3` for touch targets
- Stats cards: `text-lg sm:text-2xl` for mobile font scaling
- Trust metrics: `text-[10px] sm:text-xs` for dense mobile layouts

## Physics System
- `lib/physics/engine.js` — centralized spring configs, presets, animation variants
- Exports: `springConfig`, `fastSpring`, `slowSpring`, `bounceSpring`, `gentleSpring`
- Presets: `cardHover`, `buttonHover`, `iconHover`, `pageTransition`
- Variants: `cardEntrance`, `fadeIn`, `slideUp`, `scaleIn`
- Helper: `staggerDelay(index, base=0.05)` for list animations

## Architecture Intelligence (Graphify-style)
Generated reports in `architecture-graphs/`:
- **dependency-report.md**: Import relationships, cross-module dependencies
- **coupling-report.md**: Tight coupling hotspots, shared dependencies
- **architecture-hotspots.md**: Largest files, most complex modules
- **monolith-analysis.md**: Oversized page files, monolithic patterns
- **feature-boundary-report.md**: Feature system boundaries, cross-cutting concerns

## Critical Architecture Findings
1. ~~Feed system fragmented~~ → Consolidated to lib/feed/feedClient.js (2026-05-09)
2. Supabase client is hub-and-spoke bottleneck (11+ services + pages)
3. 15 files exceed 500 lines (Navbar.js: 1223, login: 899, app/page.js: 804)
4. All pages 'use client' — server component advantage negated
5. FeedCard duplicated with different prop signatures

## Refactoring Priorities
1. Trust system (cohesive: lib/trust/ + components/trust/) ✓
2. RFQ system (services + components aligned) ✓
3. ~~Feed system~~ → Consolidated: lib/feed/feedClient.js exports normalizeFeedItem, normalizeFeedResponse; app/page.js uses them (2026-05-09)
4. Feed physics config inconsistency (350/28 vs 120/20)

## RFQ/Procurement System (COMPLETE)
- **Buyer flow**: `/rfq` → `/rfq/[id]` (manage RFQ, view quotes, shortlist/reject/award)
- **Supplier flow**: `/rfq` → `/rfq/[id]/quote` (submit quote) → `/dashboard?tab=quotes` (track quotes)
- Quote statuses: submitted → shortlisted → awarded OR rejected
- Quote lifecycle: buyer can award, which closes RFQ and rejects other quotes
- `services/rfqService.js`: submitQuote, getQuotesForRFQ, getMyQuotes, updateQuoteStatus, withdrawQuote, awardQuote
- **Required setup**: Run SUPABASE_SCHEMA.md in Supabase SQL Editor to create quotes table with RLS

## Recent Changes
- TanStack Query v5 migration: Created `lib/queries/rfqQueries.js` with centralized hooks
- lib/queries/supplierQueries.js: useSupplierList, useSupplierProfile, useFeaturedSuppliers, useLocalSuppliers
- lib/queries/productQueries.js: useProductList, useProductDetail, useProductsByIds
- Migrated: app/rfq/page.js, app/rq/[id]/page.js, app/rfq/[id]/quote/page.js, app/dashboard/page.js, app/suppliers/page.js, app/suppliers/[id]/page.js, app/products/[id]/page.js, app/marketplace/product/[id]/page.js
- Phase 4: Feed consolidation complete, TanStack Query migration in progress
- ProductCard.js: Enhanced with TrustBadge, MOQ badge, physics hover, WhatsApp action
- Supplier page: Physics cards, TrustScoreRing, shimmer loading skeleton
- TrustBadge.js: Added TrustScoreRing, TrustBar exports with physics
- Dashboard: Integrated TrustScoreRing, added operational intelligence panel with 6 metrics
- RFQ page: RFQCard with urgency scoring, high-budget indicator, quote count badge
- All pages now use Container component for responsive layout

## User Preferences
- Terse responses, no summaries
- No architecture changes in Phase 2
- Build test after each batch
