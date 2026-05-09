// lib/queries/rfqQueries.js
// Centralized TanStack Query v5 hooks for RFQ system
// Single source of truth for all RFQ data fetching

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRFQs, getRFQById, getRFQStats, createRFQ, closeRFQ } from '@/services/rfqService';
import { submitQuote, getQuotesForRFQ, getMyQuotes, updateQuoteStatus, withdrawQuote, awardQuote } from '@/services/rfqService';

// ============ Query Key Factory ============
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

// ============ Query Configs ============
const STALE_TIMES = {
  rfqList: 1000 * 60 * 2,        // 2 min — RFQ marketplace changes often
  rfqDetail: 1000 * 60 * 5,      // 5 min — detail is stable
  rfqStats: 1000 * 60 * 1,       // 1 min — stats can update frequently
  quotes: 1000 * 60 * 3,         // 3 min — quotes don't change often
};

// ============ RFQ List Query ============
export function useRFQList(filters = {}, page = 0) {
  return useQuery({
    queryKey: rfqKeys.list({ ...filters, page }),
    queryFn: () => fetchRFQs({ ...filters, page, pageSize: 18 }),
    staleTime: STALE_TIMES.rfqList,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
}

// ============ RFQ Detail Query ============
export function useRFQDetail(id) {
  return useQuery({
    queryKey: rfqKeys.detail(id),
    queryFn: () => getRFQById(id),
    staleTime: STALE_TIMES.rfqDetail,
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
}

// ============ RFQ Stats Query ============
export function useRFQStats(userId) {
  return useQuery({
    queryKey: rfqKeys.stats(userId),
    queryFn: () => getRFQStats(userId),
    staleTime: STALE_TIMES.rfqStats,
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}

// ============ Create RFQ Mutation ============
export function useCreateRFQ() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRFQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rfqKeys.all });
    },
  });
}

// ============ Close RFQ Mutation ============
export function useCloseRFQ() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: closeRFQ,
    onSuccess: (_data, rfqId) => {
      queryClient.invalidateQueries({ queryKey: rfqKeys.all });
      queryClient.invalidateQueries({ queryKey: rfqKeys.detail(rfqId) });
    },
  });
}

// ============ Quotes for RFQ Query ============
export function useQuotesForRFQ(rfqId) {
  return useQuery({
    queryKey: rfqKeys.quotes.forRFQ(rfqId),
    queryFn: () => getQuotesForRFQ(rfqId),
    staleTime: STALE_TIMES.quotes,
    enabled: !!rfqId,
    refetchOnWindowFocus: false,
  });
}

// ============ My Quotes Query ============
export function useMyQuotes() {
  return useQuery({
    queryKey: rfqKeys.quotes.mine(),
    queryFn: getMyQuotes,
    staleTime: STALE_TIMES.quotes,
    refetchOnWindowFocus: false,
  });
}

// ============ Submit Quote Mutation ============
export function useSubmitQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitQuote,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: rfqKeys.quotes.forRFQ(variables.rfqId) });
      queryClient.invalidateQueries({ queryKey: rfqKeys.quotes.mine() });
    },
  });
}

// ============ Update Quote Status Mutation ============
export function useUpdateQuoteStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quoteId, status }) => updateQuoteStatus(quoteId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

// ============ Award Quote Mutation ============
export function useAwardQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: awardQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: rfqKeys.all });
    },
  });
}

// ============ Withdraw Quote Mutation ============
export function useWithdrawQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: withdrawQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rfqKeys.quotes.mine() });
    },
  });
}