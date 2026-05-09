# Changelog

## 2026-05-09 — Phase 4 Architecture Stabilization

### Fixed
- **app/page.js**: CRITICAL JSX corruption — `useCommunityFeed` body was orphaned after failed edit. Reconstructed full hook (useState, useCallback, useRef, useEffect, try/catch/finally). Build restored to passing.
- **app/page.js**: Now imports `normalizeFeedItem`, `normalizeFeedResponse` from `lib/feed/feedClient.js`, removing duplicate inline implementations.

### TanStack Query v5 Migration
- **NEW: lib/queries/rfqQueries.js**: Centralized TanStack Query v5 hooks for RFQ system. Exports: useRFQList, useRFQDetail, useRFQStats, useQuotesForRFQ, useMyQuotes, useSubmitQuote, useUpdateQuoteStatus, useAwardQuote, useWithdrawQuote, useCreateRFQ, useCloseRFQ. Centralized query keys factory + stale times.
- **NEW: lib/queries/supplierQueries.js**: useSupplierList, useSupplierProfile, useFeaturedSuppliers, useLocalSuppliers. Stale times: 2-10 min.
- **NEW: lib/queries/productQueries.js**: useProductList, useProductDetail, useProductsByIds. Stale times: 2-5 min.
- **app/rfq/page.js**: Migrated from manual useState/useEffect to useRFQList hook. Removed loadMore pagination.
- **app/rfq/[id]/page.js**: Migrated to useRFQDetail, useQuotesForRFQ, useUpdateQuoteStatus, useAwardQuote. Removed manual loading state + quote status management.
- **app/rfq/[id]/quote/page.js**: Migrated to useRFQDetail + useSubmitQuote mutation.
- **app/dashboard/page.js**: Migrated to useRFQStats + useMyQuotes. Removed manual loadQuotes callback + quotesLoading state.
- **app/suppliers/page.js**: Migrated to useSupplierList. Removed loadMore pagination, useCallback pattern.
- **app/suppliers/[id]/page.js**: Migrated to useSupplierProfile. Removed useEffect + manual state.
- **app/products/[id]/page.js**: Migrated to useProductDetail. Removed useEffect + manual state + AbortController.
- **app/marketplace/product/[id]/page.js**: Migrated to useProductDetail. Removed manual useState/useEffect.

### Architecture
- **Feed consolidation**: `lib/feed/feedClient.js` exports `normalizeFeedItem`, `normalizeFeedResponse` — single source of truth for feed normalization.
- **Query orchestration**: `lib/queries/rfqQueries.js` — first centralized query layer. Pattern to follow for productService, supplierService, etc.

## 2026-05-08 — Phase 2 UI Polish

### Enhanced
- **ProductCard.js**: Added `'use client'`, framer-motion physics (y: -4 hover), TrustBadge integration, MOQ badge, verified badge overlay, WhatsApp action button, responsive design, price formatting
- **app/suppliers/page.js**: Extracted `SupplierCard` with physics (y: -6, scale: 1.02 hover), TrustScoreRing bar animation, shimmer skeleton loader, animated hero gradient, `AnimatePresence` for card list
- **components/trust/TrustBadge.js**: Added `TrustScoreRing` export (animated SVG progress), `TrustBar` export (gradient progress bar), `motion.span` on badge with scale hover
- **app/dashboard/page.js**: Integrated `AnimatedTrustRing` from TrustBadge, renamed local component to `TrustScoreCard` to avoid conflict
- **app/community/page.js**: Fixed unclosed `</motion.div>` tag

### Enhanced
- **app/dashboard/page.js**: Responsive grid fixes (2→4 cols on desktop), sm/md/lg breakpoints for stats cards, operational metrics panel, trust/profile, quick actions
- **app/rfq/page.js**: Mobile hero typography (text-2xl→text-4xl), stacked buttons on mobile, responsive card grid (gap-4 sm:gap-6)
- **app/suppliers/page.js**: Mobile hero typography, responsive card grid, sm-sized CTA buttons
- **app/rfq/page.js**: Migrated to `lib/physics/engine` (springConfig, staggerDelay), removed local springConfig

### Fixed
- **middleware.js**: Removed duplicate `response` variable declaration (build blocker)
- **providers/QueryProvider.js**: Moved `ReactQueryDevtools` import to top of file
- **app/suppliers/page.js**: Fixed `Container` closing tag (`</Container>` not `</div>`)

### Added
- **lib/physics/engine.js**: Centralized motion system with spring configs, hover presets, animation variants, staggerDelay helper
- **components/ui/Skeleton.js**: Standardized skeleton loaders (CardSkeleton, CardGridSkeleton, ListSkeleton, StatSkeleton, StatsGridSkeleton)
- **components/ui/EmptyState.js**: Standardized empty states (EmptyState, NoProductsEmpty, NoSuppliersEmpty, NoRFQsEmpty, NoSearchResults)
- **services/rfqService.js**: Added quote system functions (submitQuote, getQuotesForRFQ, getMyQuotes, updateQuoteStatus, withdrawQuote, hasUserQuoted)
- **app/rfq/[id]/quote/page.js**: Supplier quote submission page with RFQ summary, quote form, duplicate protection
- **app/rfq/[id]/page.js**: RFQ detail page with quote comparison (buyer view), QuoteCard with shortlist/reject/award actions, quote status lifecycle
- **app/dashboard/page.js**: Added "My Quotes" tab with submitted quotes list, status indicators (pending/shortlisted/awarded/rejected), lazy loading on tab switch
- **services/rfqService.js**: Added awardQuote function to award RFQ to supplier, rejects other quotes, closes RFQ

### Build Status
- `npm run build`: ✓ Passing (39 routes)

### Enhanced
- **app/rfq/page.js**: Migrated to `lib/physics/engine` (springConfig, staggerDelay), removed local springConfig
- **app/suppliers/page.js**: Migrated to `lib/physics/engine` (springConfig, staggerDelay), removed local springConfig

### Build Status
- `npm run build`: ✓ Passing (39 routes)

## 2026-05-08 — Phase 1 Stabilization

### Fixed
- All critical build errors resolved
- Audit report generated (AUDIT_REPORT.md)
