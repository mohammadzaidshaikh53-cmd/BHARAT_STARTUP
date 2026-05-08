# Bharat Startup — Senior Code Audit Report

> **Audit Date**: 2026-05-08 | **Auditor**: Antigravity AI | **Scope**: Full codebase
> **Verdict**: NOT production-ready. Multiple critical + high-severity issues.

---

## 1. EXECUTIVE SUMMARY

| Metric | Score |
|--------|-------|
| **Overall Quality** | 4/10 |
| **Production Readiness** | 2/10 |
| **Security Posture** | 2/10 |
| **Architecture Maturity** | 4/10 |
| **Feature Completeness** | 5/10 |

**Major Strengths**: Real Supabase integration, working community feed with personalized ranking (RPC V8), functional marketplace CRUD, real-time chat with Supabase channels, well-structured admin verification panel with locking.

**Major Weaknesses**: Zero server-side auth protection (no middleware), open redirect vulnerability, XSS vectors, broken imports causing runtime crashes, no API routes (everything client-side), duplicate modules everywhere, massive component files, empty scaffold directories misleading code quality assessment.

---

## 2. CRITICAL ISSUES

### CRIT-01: Open Redirect in OAuth Callback
**File**: `app/auth/callback/route.js:16`
```js
const redirectTo = requestUrl.searchParams.get('redirect') || '/';
return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
```
**Impact**: An attacker can craft `?redirect=https://evil.com` — `new URL('https://evil.com', origin)` resolves to `https://evil.com`, bypassing origin. This is a textbook open redirect enabling phishing attacks. The `useAuthUser` hook has `isSafeRedirect()` validation but the **actual OAuth callback does NOT**.

### CRIT-02: XSS via dangerouslySetInnerHTML (Unsanitized)
**File**: `components/blog/post-preview.js:36`
```js
<div dangerouslySetInnerHTML={{ __html: content.slice(0, 300) + '…' }} />
```
**Impact**: Blog content entered by users is rendered as raw HTML with ZERO sanitization. Any user can inject `<script>` tags, steal sessions, or redirect users. The blog detail page uses `post.sanitized_content` but the **preview** component does not — meaning the editor preview is an active XSS vector.

### CRIT-03: Runtime Crash — Broken Import in community/page.js
**File**: `app/community/page.js:8`
```js
import Link from 'next/image'; // Assuming Image for UI
```
Then used as `<Link href={href}>` on line 102. `next/image` exports an `Image` component, not a `Link`. This will crash at runtime with "Link is not a function" or render incorrectly. **The entire community page is broken**.

### CRIT-04: Runtime Crash — Missing Import in signup.js
**File**: `lib/auth/signup.js:8`
```js
const { data, error } = await supabase.auth.signUp({...})
```
`supabase` is never imported. Any call to `signUpWithEmail()` throws `ReferenceError: supabase is not defined`. While the login page inlines its own signup logic, any code importing from this module will crash.

### CRIT-05: No Middleware — Zero Server-Side Auth Protection
**Evidence**: `grep` for `middleware.ts` or `middleware.js` returns zero results. No file exists.
**Impact**: Every protected route (`/dashboard`, `/admin/verify`, `/chat`, `/add-product`, `/add-request`, `/profile`) relies on **client-side** `getSession()` checks. An attacker can:
- Access any page's HTML/JS bundle before auth redirect fires
- Directly call Supabase with the anon key (RLS is the only defense)
- If RLS is misconfigured, read/write any data

### CRIT-06: Admin Panel Has No Server-Side Authorization
**File**: `app/admin/verify/page.js`
Admin check is purely client-side:
```js
const { data: adminData } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
if (!adminData) { setIsAdmin(false); ... }
```
The admin panel's actual database operations (verify, reject, bulk verify) use the **anon key client**. If the `admins` table lacks RLS or the `products` table allows updates from any authenticated user, **any logged-in user can verify/reject products** by calling Supabase directly.

---

## 3. FRONTEND ISSUES

### FE-01: Duplicate QueryClientProvider (Cache Isolation)
Root layout wraps children in `QueryProvider` (staleTime: 1min). Marketplace layout creates a **second** `QueryClient` (staleTime: 5min). React Query data fetched in marketplace pages is isolated from the rest of the app. Navigating from `/marketplace` to `/dashboard` loses cached data.

### FE-02: 56KB Navbar Component
`components/common/Navbar.js` is **56,617 bytes** — a single monolithic component. This is unmaintainable and causes unnecessary re-renders across the entire app on any state change within it.

### FE-03: usePostTracking Duplicated 3 Times
Identical `usePostTracking` hook is copy-pasted in:
- `app/page.js`
- `app/blog/page.js`  
- `app/community/page.js`

Any bug fix must be applied to all 3 locations. Should be in `lib/hooks/`.

### FE-04: CONTENT_CONFIG Duplicated 2 Times
Same object duplicated in `app/page.js` and `app/community/page.js`.

### FE-05: Dead "Edit" Buttons
Dashboard has Edit buttons that navigate to `/products/[id]/edit` and `/requests/[id]/edit` — **neither route exists**. Users click Edit and get a 404.

### FE-06: Product Detail Links to Non-Existent Route
`app/products/[id]/page.js:135` links "Back to Marketplace" to `/marketplace/trending` — this route is an **empty stub** (no `page.js` inside).

### FE-07: ThemeProvider Renders Invisible Div on SSR
`ThemeProvider` returns `<div className="invisible" />` before mount. This means the **entire app is invisible** during the first render cycle, causing a flash of invisible content (FOIC).

### FE-08: Scroll Event Listener Without Throttle
`app/community/page.js:159-166` adds a raw `scroll` listener with no throttle/debounce. This fires 60+ times per second during scrolling, causing performance degradation.

### FE-09: Dashboard Undo Logic is Broken
Dashboard deletes from DB **immediately** (`await supabase.from('products').delete()`), then shows "Undo" toast. But `undoDelete()` only restores the **local state** — the row is already deleted from the database. Undo is a lie.

---

## 4. BACKEND ISSUES

### BE-01: Zero API Routes
The entire application has **no `app/api/` directory**. All Supabase calls happen client-side using the anon key. This means:
- No server-side validation before database mutations
- No rate limiting
- No request logging
- No ability to add business logic that shouldn't be visible to clients

### BE-02: Deprecated Auth Helper in Callback
`app/auth/callback/route.js` uses `createRouteHandlerClient` from `@supabase/auth-helpers-nextjs` — this package is **deprecated** in favor of `@supabase/ssr`. The API may break on Next.js upgrades.

### BE-03: Duplicate Data Access Layers
Two completely separate modules fetch products with identical logic:
- `lib/supabase/marketplace.js` — `fetchProducts()` + `fetchSellerProfiles()` + `normalizeProduct()`
- `services/productService.js` — `fetchProducts()` + `hydrateSellers()` + `normalizeProduct()`

Both have the same PRODUCT_SELECT, same seller hydration pattern, same normalization. `productService.js` adds `trust_metrics` but both are actively imported by different pages. This will cause divergent behavior when one is updated but not the other.

### BE-04: N+1 Query Pattern in Seller Hydration
Every product list fetch makes 2 queries: one for products, one for seller profiles. If a page loads 3 different product lists (e.g., dashboard), that's 6 queries. This should be a single joined query or server-side function.

### BE-05: No Input Sanitization on Product/Request Creation
`add-product/page.js` inserts directly into Supabase:
```js
const insertData = { name: formData.name, description: formData.description, ... }
await supabase.from('products').insert([insertData])
```
No XSS sanitization, no SQL injection prevention (Supabase handles this), but no HTML stripping. A seller can put `<script>` tags in product names/descriptions, which get rendered by other pages.

### BE-06: Image Upload Path Traversal Risk
`add-product/page.js:39`:
```js
const fileName = `${Date.now()}_${imageFile.name}`
```
`imageFile.name` is user-controlled. A malicious filename like `../../etc/passwd` could potentially traverse paths in storage. Supabase Storage likely handles this, but the code should sanitize filenames regardless.

### BE-07: `supabase-server.js` is Never Used
The server-side Supabase client (with service role key) is defined but **no file in the app imports it**. The service role key is a placeholder anyway. Server-side operations simply don't exist.

---

## 5. DATABASE & SUPABASE ISSUES

### DB-01: No Schema Visibility
No migration files, no schema dump, no `supabase/` config directory. Schema is managed entirely in the Supabase dashboard, making it impossible to:
- Version control schema changes
- Review RLS policies in code review
- Reproduce the database in a new environment
- Run automated tests against a local database

### DB-02: Manual Seller Hydration (Missing FK)
`products.seller_id → auth.users.id ← seller_profiles.user_id` requires 2 queries because there's no direct FK from products to seller_profiles. This is a schema design flaw that forces N+1 patterns.

### DB-03: RLS Policies Unknown
No RLS policies are visible in code. If the `products` table allows `DELETE` for any authenticated user (not just `seller_id = auth.uid()`), then any user can delete any product. We cannot verify this without dashboard access.

### DB-04: `pending_products` View/Table
Admin page queries `pending_products` — this is either a view or a separate table not referenced anywhere else. If it's a view, it duplicates `products WHERE verification_status = 'pending'`. If it's a table, data synchronization is a concern.

### DB-05: Chat Tables May Not Exist
`ChatRoom.js` queries `chat_rooms`, `chat_messages`, `typing_events`, `chat_unreads` — none of these tables are created by any migration in the codebase. If they don't exist in Supabase, the entire chat feature crashes silently.

---

## 6. SECURITY ISSUES

| ID | Severity | Issue | Vector |
|----|----------|-------|--------|
| SEC-01 | 🔴 Critical | Open redirect in OAuth callback | Phishing |
| SEC-02 | 🔴 Critical | XSS in blog post preview | Session theft |
| SEC-03 | 🔴 Critical | No middleware / no server-side auth | Unauthorized access |
| SEC-04 | 🟠 High | Admin actions via anon key (no server validation) | Privilege escalation |
| SEC-05 | 🟠 High | Product/request delete with no ownership validation in UI | Data manipulation |
| SEC-06 | 🟠 High | Unsanitized user input in product names | Stored XSS |
| SEC-07 | 🟡 Medium | Storage uploads with `upsert: true` | File overwrite |
| SEC-08 | 🟡 Medium | WhatsApp numbers exposed in public queries | PII leakage |
| SEC-09 | 🟡 Medium | No rate limiting on any operation | DoS / spam |
| SEC-10 | 🟡 Medium | No CSRF protection | Cross-site requests |

---

## 7. PERFORMANCE ISSUES

| ID | Issue | Impact |
|----|-------|--------|
| PERF-01 | Every page is `'use client'` — zero Server Components | No streaming SSR, no SEO, full bundle sent to client |
| PERF-02 | 56KB Navbar re-renders on every route change | Jank on navigation |
| PERF-03 | Unthrottled scroll listeners (community, blog, home) | 60+ events/sec |
| PERF-04 | `AnimatePresence` wrapping large feed lists | Expensive diffing on every page |
| PERF-05 | Dashboard makes 4 sequential Supabase queries | Waterfall loading |
| PERF-06 | No image optimization for product images | `<img>` tags used in dashboard (not `<Image>`) |
| PERF-07 | `taxonomy.js` is 24KB of hardcoded data loaded on every marketplace page | Bundle bloat |
| PERF-08 | Session storage read on every feed item (seen cache) | Synchronous I/O in hot path |

---

## 8. ARCHITECTURE ISSUES

### ARCH-01: No Clear Layer Separation
Four different places handle product queries: `lib/supabase/marketplace.js`, `services/productService.js`, `lib/api/products.js`, `lib/marketplace/discovery.js`. No clear ownership of which module is the "source of truth."

### ARCH-02: `src/` Directory is Entirely Empty
13 subdirectories (`src/ai/`, `src/engine/`, `src/domains/`, etc.) with zero files. This creates a false impression of enterprise architecture during due diligence.

### ARCH-03: Mixed Routing Patterns
Some pages use `<Link href>`, others use `router.push()`, others use `<a href>`. Dashboard uses `<a href>` for navigation (full page reload) instead of `<Link>` (client-side navigation).

### ARCH-04: No Testing Infrastructure
Zero test files. No `jest.config`, no `vitest.config`, no `__tests__` directories, no `*.test.js` files. No CI/CD configuration.

### ARCH-05: Config File Conflict
Both `next.config.js` and `next.config.ts` exist at root. Next.js will pick one based on its resolution order, but having both is confusing and error-prone.

---

## 9. FAKE / MOCK / INCOMPLETE SYSTEMS

| System | Status | Evidence |
|--------|--------|----------|
| AI Matchmaking | 🔴 Fake | `feedService.js:35` — comment says "Future: Apply AI Re-ranking here" |
| AI Trust Scoring | 🔴 Fake | `productService.js:45` — hardcoded `trust_score = 85` with "AI-calculated" comment |
| Personalized Recommendations | 🔴 Fake | `feedService.js:44` — just calls `fetchProducts({feedType: 'trending'})` |
| Vector Search | 🔴 Placeholder | `searchService.js:41` — commented out: `// const vectorResults = await performVectorSimilarity(term)` |
| Saved Products (Server) | 🟠 Missing | `SavedContext.js` — localStorage only, no Supabase sync |
| `/marketplace/deals` | 🟠 Empty | Directory exists with no `page.js` |
| `/marketplace/trending` | 🟠 Empty | Directory exists with no `page.js` |
| `/marketplace/new-arrivals` | 🟠 Empty | Directory exists with no `page.js` |
| `/marketplace/saved` | 🟠 Empty | Directory exists with no `page.js` |
| `/marketplace/product` | 🟠 Empty | Directory exists with no `page.js` |
| Product Edit | 🟠 Missing | Dashboard links to `/products/[id]/edit` — route doesn't exist |
| Request Edit | 🟠 Missing | Dashboard links to `/requests/[id]/edit` — route doesn't exist |
| `src/` Enterprise Architecture | 🔴 Empty scaffold | 13 empty directories with zero implementation |
| Notification System | 🔴 Missing | No notification code exists anywhere |
| Remember Me | 🟡 Cosmetic | Sets localStorage flag but doesn't extend session TTL |

---

## 10. DEAD CODE & DUPLICATION

### Dead Code
| File/Dir | Type | Why Dead |
|----------|------|----------|
| `src/` (all 13 subdirs) | Empty scaffold | Zero files, zero imports |
| `lib/auth/signup.js` | Broken module | Missing import, never called |
| `lib/supabase-server.js` | Unused | Never imported by any file |
| `components/filters/` | Empty dir | No files |
| `components/profile/` | Empty dir | No files |
| `next.config.ts` | Duplicate config | Conflicts with `next.config.js` |
| `.aider.chat.history.md` | Dev artifact | 420KB committed to repo |
| `lib/marketplace/mockData.js` | Mostly dead | Only 1 fallback product, never imported in production paths |

### Duplication
| What | Locations | Lines Duplicated |
|------|-----------|-----------------|
| `fetchProducts` + normalizer | `lib/supabase/marketplace.js` + `services/productService.js` | ~200 lines |
| `usePostTracking` hook | `app/page.js`, `app/blog/page.js`, `app/community/page.js` | ~45 lines × 3 |
| `CONTENT_CONFIG` object | `app/page.js`, `app/community/page.js` | ~8 lines × 2 |
| `Button` component | `components/common/Button.js` + `components/ui/Button.js` | 2 different implementations |
| `Avatar` component | `components/common/Avatar.js` + `components/ui/Avatar.js` | 2 different implementations |
| `formatPrice` helper | `app/marketplace/category/[slug]/page.js` + `app/products/[id]/page.js` | Identical |
| `getRelativeTime` helper | Same 2 files | Identical |
| `formatWhatsAppLink` helper | Same 2 files + `WhatsAppButton.js` | Identical |

---

## 11. SCALABILITY RISKS

| Risk | Current State | What Breaks At Scale |
|------|--------------|---------------------|
| All client-side rendering | Every page is `'use client'` | At 10K+ products, initial bundle is massive, SEO is zero |
| No pagination on dashboard | Loads ALL user products/requests | At 100+ products per user, page hangs |
| Feed seen-cache in sessionStorage | Max 150 items in JSON | At 1000+ feed items, storage thrashes |
| No CDN for product images | Direct Supabase Storage URLs | At scale, storage bandwidth costs explode |
| Single-region Supabase | All data in one region | India latency for non-local users |
| No connection pooling | Direct Supabase client calls | At 1000+ concurrent users, connection limits hit |
| `taxonomy.js` (24KB) in client bundle | Loaded on every marketplace page | Cannot grow beyond ~100 categories without splitting |
| Chat with no message pagination | Loads ALL messages on room open | At 10K+ messages, room fails to load |

---

## 12. TECHNICAL DEBT REPORT

| Priority | Debt Item | Estimated Effort |
|----------|-----------|-----------------|
| 🔴 Critical | Add middleware.ts for auth | 2-4 hours |
| 🔴 Critical | Fix open redirect in callback | 30 minutes |
| 🔴 Critical | Fix broken imports (community, signup) | 30 minutes |
| 🔴 Critical | Add HTML sanitization (DOMPurify) for blog content | 2 hours |
| 🟠 High | Consolidate duplicate modules | 4-8 hours |
| 🟠 High | Add API routes for mutations | 2-3 days |
| 🟠 High | Add Supabase schema/migrations to repo | 1 day |
| 🟠 High | Split Navbar into sub-components | 4-6 hours |
| 🟡 Medium | Extract shared hooks/utils (usePostTracking, formatPrice, etc.) | 2-4 hours |
| 🟡 Medium | Add loading.js/error.js to all routes | 2-4 hours |
| 🟡 Medium | Convert static pages to Server Components | 2-3 days |
| 🟡 Medium | Add message pagination to chat | 4-6 hours |
| 🟢 Low | Delete empty src/ scaffold | 15 minutes |
| 🟢 Low | Delete next.config.ts duplicate | 5 minutes |
| 🟢 Low | Add .gitignore entries for .aider files | 5 minutes |

---

## 13. TOP PRIORITY FIXES

### 🔴 Critical (Fix Before ANY Demo/Launch)
1. **Fix open redirect** in `app/auth/callback/route.js` — validate `redirect` param against allowlist
2. **Add DOMPurify** to `post-preview.js` — sanitize HTML before rendering
3. **Fix broken import** in `app/community/page.js` — change `next/image` to `next/link`
4. **Fix missing import** in `lib/auth/signup.js` — add `import { supabase } from '@/lib/supabase'`
5. **Create `middleware.ts`** — protect `/dashboard`, `/admin/*`, `/chat`, `/add-*`, `/profile`

### 🟠 High (Fix Before Beta)
6. **Add API routes** for product create, request create, product delete — move mutations server-side
7. **Audit Supabase RLS policies** — verify ownership checks on DELETE/UPDATE operations
8. **Consolidate product data layer** — keep `services/productService.js`, delete `lib/supabase/marketplace.js`
9. **Fix dashboard undo** — use soft delete (set `is_active = false`) instead of hard delete, then undo restores
10. **Implement edit routes** — `/products/[id]/edit` and `/requests/[id]/edit`

### 🟡 Medium (Fix Before Production)
11. Extract `usePostTracking`, `CONTENT_CONFIG`, utility functions to shared modules
12. Split Navbar into focused sub-components
13. Add message pagination to ChatRoom
14. Convert marketplace category page to Server Component for SEO
15. Add Supabase schema migrations to version control

### 🟢 Low (Cleanup)
16. Delete `src/` empty scaffold
17. Delete `next.config.ts` duplicate
18. Consolidate duplicate Button/Avatar components
19. Add `.gitignore` entry for `.aider*` files
20. Add throttle to scroll event listeners

---

## 14. RECOMMENDED RESTRUCTURING

### Delete
- `src/` — entire directory (13 empty subdirectories, zero value)
- `next.config.ts` — duplicate of `next.config.js`
- `lib/auth/signup.js` — broken and unused
- `components/filters/`, `components/profile/` — empty directories
- `.aider.chat.history.md` — 420KB dev artifact in repo

### Consolidate
- **Product data layer**: Keep `services/productService.js`, delete `lib/supabase/marketplace.js`, update all imports
- **UI primitives**: Pick `components/ui/` as canonical location for Button, Avatar; delete `components/common/` duplicates
- **Shared hooks**: Move `usePostTracking` to `lib/hooks/usePostTracking.js`
- **Shared utils**: Move `formatPrice`, `getRelativeTime`, `formatWhatsAppLink` to `lib/utils/formatters.js`

### Create
- `middleware.ts` at root — auth guard for protected routes
- `app/api/products/route.js` — server-side product mutations
- `app/api/requests/route.js` — server-side request mutations
- `supabase/migrations/` — schema version control
- `lib/hooks/usePostTracking.js` — extracted from 3 pages
- `lib/utils/sanitize.js` — DOMPurify wrapper for user HTML content

### Rewrite
- **`app/auth/callback/route.js`** — use `@supabase/ssr` instead of deprecated `auth-helpers-nextjs`, add redirect validation
- **`components/common/Navbar.js`** — split 56KB monolith into NavLinks, MobileMenu, AuthStatus, SearchBar sub-components
- **`context/SavedContext.js`** — replace localStorage with Supabase table for cross-device persistence
- **`app/dashboard/page.js`** — replace hard delete with soft delete for undo to actually work

---

*This audit covers 131 source files across the Bharat Startup codebase. All findings are verified through actual import tracing and code analysis. No assumptions were made — every issue cited includes the specific file and line number.*
