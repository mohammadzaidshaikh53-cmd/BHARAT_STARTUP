# Deployment Guide

## Build
```bash
npm run build
```

## Development
```bash
npm run dev
```

## Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Supabase Setup Required
1. Run `SUPABASE_SCHEMA.md` SQL in Supabase SQL Editor to create:
   - `quotes` table with indexes
   - RLS policies for quote access control
2. Test quote submission and award flow

## Build Status
- ✓ All 39 routes compile
- ⚠ `middleware.js` deprecated → rename to `proxy.js` for Next.js 16
- ⚠ `@tanstack/react-query-devtools` installed separately

## Static Routes (○)
`/`, `/_not-found`, `/add-product`, `/add-request`, `/admin/verify`, `/biographies/new`, `/blog`, `/blog/new`, `/chat`, `/community`, `/community/forums`, `/community/questions`, `/community/questions/new`, `/dashboard`, `/discussions/new`, `/events`, `/ideas/new`, `/login`, `/marketplace`, `/motivation/new`, `/notifications`, `/organizations`, `/organizations/create`, `/organizations/industries`, `/organizations/verified`, `/premium/plans`, `/profile`, `/qa/new`, `/reset-password`, `/rfq`, `/rfq/create`, `/settings`, `/stores`, `/suppliers`, `/suppliers/local`

## Dynamic Routes (ƒ)
`/api/products`, `/api/products/[id]`, `/auth/callback`, `/blog/[slug]`, `/community/forums/[topicId]`, `/community/forums/[topicId]/[threadId]`, `/community/questions/[id]`, `/dashboard/organization/[id]`, `/events/[id]`, `/marketplace/category/[slug]`, `/marketplace/deals`, `/marketplace/new-arrivals`, `/marketplace/product/[id]`, `/marketplace/saved`, `/marketplace/trending`, `/organizations/[slug]`, `/organizations/industries/[slug]`, `/products/[id]`, `/products/[id]/edit`, `/rfq/[id]/edit`, `/stores/[storeId]`, `/suppliers/[id]`

## Deployment Target
- Vercel (recommended) or any Node.js host
- Supabase project required for database + auth
