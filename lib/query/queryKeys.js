/**
 * Centralized Query Key Factory
 * Pattern from: Stripe, Shopify, Linear
 *
 * Provides:
 * - Type-safe query keys
 * - Consistent key naming
 * - Automatic cache invalidation by entity
 * - Real-time subscription keys
 */

// Entity keys
export const queryKeys = {
  // Auth
  auth: ['auth'] as const,
  user: ['auth', 'user'] as const,
  session: ['auth', 'session'] as const,

  // Products
  products: (filters = {}) => ['products', filters] as const,
  product: (id) => ['products', id] as const,
  productBySlug: (slug) => ['products', 'slug', slug] as const,

  // RFQs
  rfqs: (filters = {}) => ['rfqs', filters] as const,
  rfq: (id) => ['rfqs', id] as const,
  myRfqs: () => ['rfqs', 'my'] as const,

  // Quotes
  quotes: (rfqId) => ['quotes', rfqId] as const,
  quote: (id) => ['quotes', id] as const,

  // Marketplace
  marketplace: (filters = {}) => ['marketplace', filters] as const,
  categories: () => ['categories'] as const,
  category: (slug) => ['categories', slug] as const,
  trending: () => ['marketplace', 'trending'] as const,
  newArrivals: () => ['marketplace', 'new-arrivals'] as const,
  deals: () => ['marketplace', 'deals'] as const,

  // Community
  feed: (type = 'all') => ['feed', type] as const,
  posts: (filters = {}) => ['posts', filters] as const,
  post: (id) => ['posts', id] as const,
  postComments: (postId) => ['posts', postId, 'comments'] as const,
  forums: () => ['forums'] as const,
  forum: (id) => ['forums', id] as const,
  forumThreads: (forumId) => ['forums', forumId, 'threads'] as const,

  // Chat
  chatRooms: () => ['chat', 'rooms'] as const,
  chatRoom: (roomId) => ['chat', 'rooms', roomId] as const,
  chatMessages: (roomId, cursor) => ['chat', 'rooms', roomId, 'messages', cursor] as const,
  chatUnread: () => ['chat', 'unread'] as const,

  // Notifications
  notifications: (userId) => ['notifications', userId] as const,
  unreadCount: (userId) => ['notifications', userId, 'unread-count'] as const,

  // Events
  events: (filters = {}) => ['events', filters] as const,
  event: (id) => ['events', id] as const,
  eventBooths: (eventId) => ['events', eventId, 'booths'] as const,
  eventAttendees: (eventId) => ['events', eventId, 'attendees'] as const,
  myEvents: () => ['events', 'my'] as const,

  // Organizations
  organizations: (filters = {}) => ['organizations', filters] as const,
  organization: (id) => ['organizations', id] as const,
  organizationMembers: (id) => ['organizations', id, 'members'] as const,

  // Stores (Vendor)
  stores: (filters = {}) => ['stores', filters] as const,
  store: (id) => ['stores', id] as const,
  storeProducts: (storeId) => ['stores', storeId, 'products'] as const,
  storeOrders: (storeId) => ['stores', storeId, 'orders'] as const,
  myStore: () => ['stores', 'my'] as const,

  // Dashboard
  dashboardStats: () => ['dashboard', 'stats'] as const,
  dashboardAnalytics: (range) => ['dashboard', 'analytics', range] as const,
  dashboardRecent: () => ['dashboard', 'recent'] as const,

  // Profile
  profile: (userId) => ['profile', userId] as const,
  profileBySlug: (slug) => ['profile', 'slug', slug] as const,

  // Search
  search: (query, type) => ['search', query, type] as const,
  searchSuggestions: (query) => ['search', 'suggestions', query] as const,
};

// Helper for invalidation patterns
export const invalidatePatterns = {
  // Invalidate all lists of an entity
  allLists: (entity) => [`${entity}`],

  // Invalidate specific entity + all lists
  entityAndLists: (entity, id) => [`${entity}`, `${entity}`, id],

  // Invalidate related entities
  related: (entity, relation) => [`${entity}`, `${relation}`],
};
