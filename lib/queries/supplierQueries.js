// lib/queries/supplierQueries.js
// Centralized TanStack Query v5 hooks for Supplier system
// Wraps services/supplierService.js — no duplicate business logic

import { useQuery } from '@tanstack/react-query';
import { fetchSuppliers, getSupplierProfile, getFeaturedSuppliers, getLocalSuppliers } from '@/services/supplierService';

// ============ Query Key Factory ============
export const supplierKeys = {
  all: ['suppliers'],
  list: (filters) => ['suppliers', 'list', filters],
  detail: (id) => ['suppliers', 'detail', id],
  featured: () => ['suppliers', 'featured'],
  local: (location) => ['suppliers', 'local', location],
};

// ============ Stale Time Strategy ============
const STALE_TIMES = {
  supplierList: 1000 * 60 * 2,     // 2 min — supplier profiles don't change often
  supplierDetail: 1000 * 60 * 10,  // 10 min — detail page is very stable
  featured: 1000 * 60 * 5,         // 5 min — featured suppliers rarely change
  local: 1000 * 60 * 3,            // 3 min — local suppliers can update
};

// ============ Supplier List Query ============
export function useSupplierList(filters = {}) {
  return useQuery({
    queryKey: supplierKeys.list(filters),
    queryFn: () => fetchSuppliers({ ...filters, pageSize: 18 }),
    staleTime: STALE_TIMES.supplierList,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
}

// ============ Supplier Detail Query ============
export function useSupplierProfile(userId) {
  return useQuery({
    queryKey: supplierKeys.detail(userId),
    queryFn: () => getSupplierProfile(userId),
    staleTime: STALE_TIMES.supplierDetail,
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}

// ============ Featured Suppliers Query ============
export function useFeaturedSuppliers(limit = 6) {
  return useQuery({
    queryKey: supplierKeys.featureed(),
    queryFn: () => getFeaturedSuppliers(limit),
    staleTime: STALE_TIMES.featured,
    refetchOnWindowFocus: false,
  });
}

// ============ Local Suppliers Query ============
export function useLocalSuppliers(location, limit = 12) {
  return useQuery({
    queryKey: supplierKeys.local(location),
    queryFn: () => getLocalSuppliers(location, limit),
    staleTime: STALE_TIMES.local,
    enabled: !!location,
    refetchOnWindowFocus: false,
  });
}