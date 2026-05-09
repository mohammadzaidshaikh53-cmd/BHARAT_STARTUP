# Technical Debt

## Critical (Build/Security)
| Issue | Location | Severity |
|-------|----------|----------|
| XSS via dangerouslySetInnerHTML | `components/blog/post-preview.js:36` | HIGH |
| Open redirect in OAuth callback | `app/auth/callback/route.js:16` | MEDIUM |

## Architecture
| Issue | Impact | Fix |
|-------|--------|-----|
| All pages `'use client'` — no RSC separation | Bundle size, SEO | Split data fetching into server components |
| TanStack Query underutilized | Extra re-renders, no caching | Migrate all data fetching to useQuery/useMutation |
| Duplicate data access layers | Maintenance burden | Consolidate lib/supabase + services into single pattern |
| Monolithic page files (e.g., app/page.js: 805 lines) | Hard to maintain | Extract sections into server components |
| Feed system fragmented (3 implementations) | Inconsistent behavior | Consolidate to normalizeItem single source |
| Supabase client hub-and-spoke | Single point of failure | Refactor to feature-based clients |
| Physics config inconsistency | Inconsistent motion | Centralize springConfig |

## Architecture Hotspots (from graph analysis)
| File | Lines | Issue |
|------|-------|-------|
| components/common/Navbar.js | 1223 | Too large, split by route |
| app/login/page.js | 899 | Auth form extraction |
| app/page.js | 804 | Feed consolidation needed |
| app/dashboard/page.js | 433 | Ok for now |
| components/chat/ChatRoom.js | 423 | Realtime logic extraction |

## Missing Systems (vs. Vision)
- Supplier comparison UI
- RFQ quotation workflow
- Procurement dashboard
- Reputation/karma system
- Content moderation queue
- Direct messaging
- Virtual exhibition halls
- AI matchmaking
- Multi-workspace system
- RBAC permission system
- Recommendation engine
- Semantic search

## Deprecations
- `middleware.js` → rename to `proxy.js` (Next.js 16 convention)
- `@tanstack/react-query-devtools` needs explicit install

## Quick Wins
- Add error boundaries around route groups
- Add loading.js for route-level loading states
- Add error.js for route-level error handling
- Migrate raw Supabase calls to TanStack Query hooks
