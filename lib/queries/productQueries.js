// lib/queries/productQueries.js
// Centralized TanStack Query v5 hooks for Product/Marketplace system
// Wraps services/productService.js — no duplicate business logic

import { useQuery } from '@tanstack/react-query';
import { fetchProducts, getProductById, getProductsByIds } from '@/services/productService';

// ============ Query Key Factory ============
export const productKeys = {
  all: ['products'],
  list: (feedType, filters) => ['products', 'list', feedType, filters],
  detail: (id) => ['products', 'detail', id],
  byIds: (ids) => ['products', 'byIds', ids.sort().join(',')],
};

// ============ Stale Time Strategy ============
const STALE_TIMES = {
  productList: 1000 * 60 * 2,      // 2 min — marketplace changes often
  productDetail: 1000 * 60 * 5,   // 5 min — product detail is stable
  productByIds: 1000 * 60 * 3,     // 3 min — saved items
};

// ============ Product List Query ============
export function useProductList(feedType = 'trending', filters = {}) {
  return useQuery({
    queryKey: productKeys.list(feedType, filters),
    queryFn: () => fetchProducts({ feedType, ...filters }),
    staleTime: STALE_TIMES.productList,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
}

// ============ Product Detail Query ============
export function useProductDetail(id) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductById(id),
    staleTime: STALE_TIMES.productDetail,
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
}

// ============ Products by IDs Query ============
export function useProductsByIds(ids) {
  return useQuery({
    queryKey: productKeys.byIds(ids || []),
    queryFn: () => getProductsByIds(ids || []),
    staleTime: STALE_TIMES.productByIds,
    enabled: !!(ids && ids.length > 0),
    refetchOnWindowFocus: false,
  });
}