/**
 * UI State Store (Zustand)
 * Pattern from: Linear, Notion, Figma
 *
 * Manages:
 * - Sidebar state
 * - Modal/drawer visibility
 * - Theme preferences
 * - Toast notifications
 * - Global loading states
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Toast types
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Toast store
const useToastStore = create(
  persist(
    (set, get) => ({
      toasts: [],
      maxToasts: 5,

      addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newToast = {
          id,
          type: TOAST_TYPES.INFO,
          duration: 4000,
          ...toast,
        };

        set((state) => ({
          toasts: [newToast, ...state.toasts].slice(0, state.maxToasts),
        }));

        // Auto dismiss
        if (newToast.duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, newToast.duration);
        }

        return id;
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      clearAll: () => set({ toasts: [] }),

      // Convenience methods
      success: (message, options = {}) =>
        get().addToast({ message, type: TOAST_TYPES.SUCCESS, ...options }),

      error: (message, options = {}) =>
        get().addToast({ message, type: TOAST_TYPES.ERROR, duration: 6000, ...options }),

      warning: (message, options = {}) =>
        get().addToast({ message, type: TOAST_TYPES.WARNING, ...options }),

      info: (message, options = {}) =>
        get().addToast({ message, type: TOAST_TYPES.INFO, ...options }),
    }),
    {
      name: 'one-solution-toasts',
    }
  )
);

// UI Store
const useUIStore = create(
  persist(
    (set, get) => ({
      // Sidebar
      sidebarOpen: true,
      sidebarCollapsed: false,

      // Modals
      activeModal: null,
      modalData: null,

      // Theme
      theme: 'system', // 'light' | 'dark' | 'system'
      themeOverrides: {},

      // Command palette
      commandPaletteOpen: false,

      // Mobile
      mobileMenuOpen: false,

      // Global loading
      globalLoading: false,
      loadingMessage: '',

      // Actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      collapseSidebar: () => set({ sidebarCollapsed: true }),

      expandSidebar: () => set({ sidebarCollapsed: false }),

      openModal: (modalName, data = null) =>
        set({ activeModal: modalName, modalData: data }),

      closeModal: () => set({ activeModal: null, modalData: null }),

      setTheme: (theme) => set({ theme }),

      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

      toggleMobileMenu: () =>
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),

      setGlobalLoading: (loading, message = '') =>
        set({ globalLoading: loading, loadingMessage: message }),
    }),
    {
      name: 'one-solution-ui',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);

// Notification Store (real-time state)
const useNotificationStore = create((set, get) => ({
  unreadCount: 0,
  lastChecked: null,

  setUnreadCount: (count) => set({ unreadCount: count }),

  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),

  decrementUnread: (amount = 1) =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - amount) })),

  markAllRead: () => set({ unreadCount: 0, lastChecked: new Date().toISOString() }),

  markRead: (notificationId) => set((state) => ({
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),
}));

// Chat Store (real-time state)
const useChatStore = create((set, get) => ({
  // Active conversation
  activeRoom: null,
  activeRoomUnread: 0,

  // Typing indicators (roomId -> userId[])
  typingUsers: {},

  // Online status (userId -> boolean)
  onlineUsers: {},

  // Actions
  setActiveRoom: (roomId) => set({ activeRoom: roomId, activeRoomUnread: 0 }),

  incrementRoomUnread: (roomId, amount = 1) =>
    set((state) => ({
      activeRoomUnread: state.activeRoom === roomId ? 0 : state.activeRoomUnread + amount,
    })),

  setTyping: (roomId, userId, isTyping) =>
    set((state) => {
      const current = state.typingUsers[roomId] || [];
      return {
        typingUsers: {
          ...state.typingUsers,
          [roomId]: isTyping
            ? [...new Set([...current, userId])]
            : current.filter((id) => id !== userId),
        },
      };
    }),

  setUserOnline: (userId, isOnline) =>
    set((state) => ({
      onlineUsers: { ...state.onlineUsers, [userId]: isOnline },
    })),

  setUsersOnline: (users) =>
    set({ onlineUsers: users }),

  clearActiveRoom: () => set({ activeRoom: null, activeRoomUnread: 0 }),
}));

// Search Store
const useSearchStore = create((set) => ({
  query: '',
  filters: {},
  results: [],
  isSearching: false,

  setQuery: (query) => set({ query }),
  setFilters: (filters) => set({ filters }),
  setResults: (results) => set({ results, isSearching: false }),
  setSearching: (isSearching) => set({ isSearching }),
  clearSearch: () => set({ query: '', filters: {}, results: [], isSearching: false }),
}));

// Export hooks for each store
export {
  useToastStore,
  useUIStore,
  useNotificationStore,
  useChatStore,
  useSearchStore,
  TOAST_TYPES
};

// Combined store selector for components that need multiple stores
export const useStores = () => ({
  toast: useToastStore(),
  ui: useUIStore(),
  notification: useNotificationStore(),
  chat: useChatStore(),
  search: useSearchStore(),
});
