"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, Sparkles } from "lucide-react";
import { useOrganizationsInfinite } from "./components/hooks/useOrganizationsInfinite";
import { useDebounce } from "./components/hooks/useDebounce";
import { OrganizationCard } from "./components/OrganizationCard";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { EmptyState } from "./components/EmptyState";
import { SearchInput } from "./components/SearchInput";
import { PageBackground } from "./components/PageBackground";
import { EcosystemPulse } from "./components/EcosystemPulse";
import { ErrorFallback } from "./components/ErrorFallback";

const SORT_OPTIONS = [
  { label: "Highest Trust", value: "trust_desc" },
  { label: "Newest", value: "new_desc" },
  { label: "Most Members", value: "members_desc" },
];

export default function OrganizationsDiscoveryPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("trust_desc");
  const [filterVerified, setFilterVerified] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useOrganizationsInfinite({
    search: debouncedSearch,
    verifiedOnly: filterVerified,
    sortBy: sort,
  });

  const organizations = data?.pages.flatMap(page => page.data) || [];
  const totalCount = data?.pages[0]?.count || 0;
  const verifiedCount = organizations.filter(o => o.verification_status === "verified").length;

  // Intersection observer for infinite scroll
  const observerRef = useRef(null);
  const lastElementRef = useCallback(node => {
    if (isFetchingNextPage) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  // Scroll to top when filters change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [debouncedSearch, filterVerified, sort]);

  if (error) {
    return <ErrorFallback error={error} resetErrorBoundary={() => refetch()} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#050505] relative">
      <PageBackground variant="default" />

      {/* Hero */}
      <div className="relative bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-black/[0.04] dark:border-white/[0.04] overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(255,153,51,0.04) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(0,60,160,0.03) 0%, transparent 70%)" }} />

        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-1.5 h-7 rounded-full" style={{ background: "linear-gradient(180deg, rgba(255,153,51,0.7), rgba(0,60,160,0.7))" }} />
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Ecosystem</span>
            </div>
            <h1 className="text-4xl md:text-[3.25rem] font-extrabold text-gray-900 dark:text-white tracking-[-0.025em] mb-5 leading-[1.1]">
              Discover Organizations
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed mb-6">
              Explore the global network of verified businesses, startups, and enterprises building the trust economy.
            </p>
            <EcosystemPulse items={[
              `${totalCount} organizations`,
              `${verifiedCount} verified`,
              `Connected ecosystem`,
            ]} />
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Controls */}
        <div className="bg-white/90 dark:bg-[#0f0f10]/90 backdrop-blur-2xl border border-black/[0.05] dark:border-white/[0.05] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] p-3 mb-10 flex flex-col md:flex-row gap-3 items-center justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="Search organizations..." />
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full appearance-none bg-slate-50/80 dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.04] rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer font-medium"
              >
                {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <button
              onClick={() => setFilterVerified(!filterVerified)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 whitespace-nowrap ${
                filterVerified
                  ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 shadow-sm"
                  : "bg-slate-50/80 dark:bg-white/[0.04] border-black/[0.04] dark:border-white/[0.04] text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.06]"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Verified
            </button>
          </div>
        </div>

        {isLoading && !organizations.length ? (
          <LoadingSkeleton count={6} />
        ) : organizations.length === 0 ? (
          <EmptyState title="No organizations found" description="Try adjusting your search or filters to find what you're looking for." />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((org, i) => (
                <motion.div
                  key={org.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.6), duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <OrganizationCard org={org} />
                </motion.div>
              ))}
            </div>
            {hasNextPage && (
              <div ref={lastElementRef} className="h-10 mt-8 flex justify-center">
                {isFetchingNextPage && (
                  <div className="py-4 text-center text-slate-400 dark:text-slate-500 text-sm">
                    Loading more organizations...
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}