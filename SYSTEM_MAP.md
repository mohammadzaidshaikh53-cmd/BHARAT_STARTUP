# System Map — Module Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                 │
│   (Auth │ Products │ Requests │ SellerProfiles │ Realtime)     │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      lib/supabase/                               │
│   client.js (browser) │ server.js (server) │ middleware.js      │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       services/                                  │
│   productService │ rfqService │ eventService │ notificationSvc  │
│   organizationService │ supplierService                           │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    app/page.js (Client)                          │
│          useEffect → supabase → useState → render                │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TanStack Query (Phase 4 active)                  │
│              QueryProvider wraps entire app                          │
│           lib/queries/rfqQueries.js — first centralized layer       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       PAGES → COMPONENTS                         │
│                                                                  │
│  app/marketplace/    ──→  components/marketplace/ProductCard    │
│  app/suppliers/      ──→  components/trust/TrustBadge           │
│  app/rfq/            ──→  components/???                        │
│  app/dashboard/      ──→  components/data-display/ProgressRing  │
│  app/community/      ──→  lib/hooks/useFeed, usePostTracking    │
│                                                                  │
│  app/page.js         ──→  components/common/Navbar              │
│                       ──→  components/ui/Container              │
│                       ──→  providers/ThemeProvider               │
│                       ──→  providers/QueryProvider              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    lib/marketplace/ (utilities)                  │
│   feedMath.js      → getFreshnessBadge, getCardAttentionLevel   │
│   uiPhysics.js     → getCardElevationClass, getGlowPulseClass   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    lib/ (state & realtime)                       │
│   store/index.js    → Zustand (UI state)                        │
│   realtime/         → Supabase channels + reconnection           │
│   trust/            → trustCalculator (6-factor weighted score)  │
│   hooks/            → useFeed, usePostTracking, useIntersection │
└─────────────────────────────────────────────────────────────────┘
```

## Architecture Intelligence
- Reports: `architecture-graphs/dependency-report.md`, `coupling-report.md`, `architecture-hotspots.md`, `monolith-analysis.md`, `feature-boundary-report.md`

## Feature Boundaries (from graph analysis)
```
Marketplace:  components/marketplace/ → lib/marketplace/ → services/productService.js
Trust:        components/trust/ → lib/trust/ → ✓ COHESIVE ✓
RFQ:          services/rfqService.js → app/rfq/ → ✓ ALIGNED ✓
Feed:         app/page.js ↔ app/community/page.js ↔ lib/hooks/useFeed.js ← FRAGMENTED
Auth:         middleware.js → app/auth/ → lib/supabase/middleware.js → ✓ SEPARATED ✓
```

## Key Dependencies
- `components/marketplace/ProductCard.js` → TrustBadge, DealCardMetrics, RankingBadge
- `app/dashboard/page.js` → TrustBadge (TrustScoreRing), productService, rfqService
- `app/community/page.js` → useFeed, usePostTracking, Avatar
- `app/suppliers/page.js` → supplierService, TrustBadge, Container
- `app/rfq/page.js` → rfqService, formatters

## Coupling Hotspots
- lib/supabase.js: imported by 11+ services + multiple pages (hub-and-spoke)
- lib/hooks/useFeed.js: duplicated normalization logic
- app/page.js: custom feed logic vs. useFeed.js implementation
