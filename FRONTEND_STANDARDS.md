# Frontend Standards

## Physics Animation Config
Import from `lib/physics/engine.js`:
```js
import { springConfig, cardHover, staggerDelay } from '@/lib/physics/engine';
```
- `springConfig`: { type: 'spring', stiffness: 350, damping: 28 } — default for all cards
- `fastSpring`: { stiffness: 500, damping: 30 } — buttons, icons
- `slowSpring`: { stiffness: 200, damping: 25 } — page transitions
- `bounceSpring`: { stiffness: 400, damping: 15 } — celebration moments
- `gentleSpring`: { stiffness: 150, damping: 35 } — subtle animations
- Presets: `cardHover`, `buttonHover`, `iconHover`, `pageTransition`
- Variants: `cardEntrance`, `fadeIn`, `slideUp`, `scaleIn`
- `staggerDelay(index)` for list animations

## Card Design
- `rounded-2xl` corners
- `border border-gray-100 dark:border-gray-700/50`
- `hover:shadow-xl hover:shadow-{color}-500/10`
- `hover:-translate-y-1` or `whileHover={{ y: -4 }}`
- Physics entrance: `initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}`

## Colors
- Primary action: `orange-500/600`
- Trust/emerald: `emerald-500/600`
- RFQ/blue: `blue-500/600`
- Community/purple: `purple-500/600`

## Dark Mode
- `dark:bg-gray-800/80` for cards
- `dark:text-gray-100` for primary text
- `dark:border-gray-700/50` for borders
- Tailwind `dark:` prefix on all color classes

## Layout
- `Container` component wraps all page content
- Hero sections: gradient backgrounds with `overflow-hidden`
- Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

## Loading States
- Skeleton with `animate-pulse`
- Spinner: `border-2 border-{color} border-t-transparent animate-spin`
- Staggered entrance with `transition={{ delay: index * 0.05 }}`

## Typography
- Hero: `text-3xl md:text-4xl font-black`
- Section: `text-xl font-bold`
- Card title: `text-lg font-bold`
- Body: `text-sm`
- Caption: `text-xs`

## Component Props
- `size` prop: `'xs' | 'sm' | 'md' | 'lg'`
- Dark mode variants on all color props
- `className` passthrough

## TanStack Query v5 (Phase 4)
Query hooks live in `lib/queries/` — centralized, not per-page.

### Query Keys
```js
export const rfqKeys = {
  all: ['rfqs'],
  list: (filters) => ['rfqs', 'list', filters],
  detail: (id) => ['rfqs', 'detail', id],
  stats: (userId) => ['rfqs', 'stats', userId],
  quotes: {
    forRFQ: (rfqId) => ['quotes', 'rfq', rfqId],
    mine: () => ['quotes', 'mine'],
  },
};
```

### Stale Times (per type)
- `rfqList`: 2 min (changes often)
- `rfqDetail`: 5 min (stable)
- `rfqStats`: 1 min (frequent updates)
- `quotes`: 3 min (rarely change)

### Pattern
```js
import { useRFQDetail, useQuotesForRFQ } from '@/lib/queries/rfqQueries';

// Use { data, isLoading, error, refetch } — never destructure state manually
const { data, isLoading, error } = useRFQDetail(id);
const quotes = data?.quotes || [];

// Mutations return .mutateAsync() — never direct import in handlers
const submitQuote = useSubmitQuote();
const result = await submitQuote.mutateAsync({ rfqId, price, ... });
```

### Rules
- All hooks from `lib/queries/` — never inline useQuery in page files
- Service functions stay in `services/` — hooks wrap them
- Mutations use `useMutation` with `onSuccess: () => invalidateQueries`
- `placeholderData: (previousData) => previousData` for pagination continuity
- `refetchOnWindowFocus: false` for all supabase-backed queries
- Migrated systems: RFQ, Supplier, Product detail pages
- Remaining manual: Marketplace feed pages (TrendingClient, DealsClient, etc.), chat/notifications
