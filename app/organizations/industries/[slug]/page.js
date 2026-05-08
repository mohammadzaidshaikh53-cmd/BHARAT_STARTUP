"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpDown, Sparkles } from "lucide-react";
import Link from "next/link";
import { fetchIndustryBySlug, fetchOrganizationsByIndustry } from "../../components/data";
import { useDebounce } from "../../components/hooks/useDebounce";
import { OrganizationCard } from "../../components/OrganizationCard";
import { LoadingSkeleton } from "../../components/LoadingSkeleton";
import { EmptyState } from "../../components/EmptyState";
import { SearchInput } from "../../components/SearchInput";
import { PageBackground } from "../../components/PageBackground";
import { EcosystemPulse } from "../../components/EcosystemPulse";
import { ErrorFallback } from "../../components/ErrorFallback";

const INDUSTRY_GLOWS = {
  technology: "rgba(59,130,246,0.05)",
  finance: "rgba(16,185,129,0.05)",
  healthcare: "rgba(239,68,68,0.04)",
  logistics: "rgba(245,158,11,0.04)",
  education: "rgba(139,92,246,0.04)",
  manufacturing: "rgba(100,116,139,0.04)",
};

export default function IndustryOrganizationsPage() {
  const { slug } = useParams();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("trust_desc");
  const [filterVerified, setFilterVerified] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  // Fetch industry details
  const { data: industryData, isLoading: industryLoading, error: industryError } = useQuery({
    queryKey: ['industry', slug],
    queryFn: () => fetchIndustryBySlug(slug),
    enabled: !!slug,
  });

  const industry = industryData?.data || null;

  // Fetch organizations with infinite scroll
  const {
    data: orgsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: orgsLoading,
    error: orgsError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['organizationsByIndustry', slug, debouncedSearch, filterVerified, sort],
    queryFn: ({ pageParam = 0 }) => fetchOrganizationsByIndustry({
      industrySlug: slug,
      search: debouncedSearch,
      verifiedOnly: filterVerified,
      sortBy: sort,
      pageParam,
    }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!slug,
  });

  const organizations = orgsData?.pages.flatMap(page => page.data) || [];
  const totalCount = orgsData?.pages[0]?.count || 0;
  const verifiedCount = organizations.filter(o => o.verification_status === "verified").length;
  const trustDensity = organizations.length > 0 ? Math.round((verifiedCount / organizations.length) * 100) : 0;

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

  if (industryError || orgsError) {
    return <ErrorFallback error={industryError || orgsError} resetErrorBoundary={() => refetch()} />;
  }

  if (industryLoading || (!industry && !industryError)) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-[#050505] flex items-center justify-center">
        <div className="text-center">Loading sector...</div>
      </div>
    );
  }

  if (!industry) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-[#050505] flex items-center justify-center">
        <EmptyState title="Industry not found" description="The sector you are looking for does not exist or has been moved." />
      </div>
    );
  }

  const glowColor = INDUSTRY_GLOWS[industry.slug] || "rgba(100,116,139,0.04)";

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#050505] relative">
      <PageBackground variant="sector" />

      <div className="relative bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-black/[0.04] dark:border-white/[0.04] overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: `radial-gradient(ellipse, ${glowColor} 0%, transparent 65%)` }} />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(255,153,51,0.02) 0%, transparent 65%)" }} />

        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 relative z-10">
          <Link href="/organizations/industries" className="inline-flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors group font-medium">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to All Industries
          </Link>

          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${industry.color} shadow-sm`} />
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Sector</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-[-0.025em] mb-3 leading-[1.1]">
                {industry.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-base leading-relaxed mb-5">{industry.description}</p>
              <EcosystemPulse items={[
                `${totalCount} organizations`,
                `${verifiedCount} verified`,
                `${trustDensity}% trust density`,
              ]} />
            </div>
            <div className="text-left md:text-right bg-slate-50/60 dark:bg-white/[0.03] backdrop-blur-xl px-6 py-4 rounded-2xl border border-black/[0.04] dark:border-white/[0.04]">
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-[-0.02em]">{totalCount}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.12em] font-semibold mt-0.5">Organizations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <SearchInput value={search} onChange={setSearch} placeholder={`Search in ${industry.name}...`} />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full appearance-none bg-white/90 dark:bg-[#0f0f10]/90 backdrop-blur-xl border border-black/[0.05] dark:border-white/[0.05] rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 outline-none shadow-sm cursor-pointer font-medium"
              >
                <option value="trust_desc">Highest Trust</option>
                <option value="members_desc">Most Members</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <button
              onClick={() => setFilterVerified(!filterVerified)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 whitespace-nowrap ${
                filterVerified
                  ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 shadow-sm"
                  : "bg-white/90 dark:bg-[#0f0f10]/90 backdrop-blur-xl border-black/[0.05] dark:border-white/[0.05] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06] shadow-sm"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Verified
            </button>
          </div>
        </div>

        {orgsLoading && !organizations.length ? (
          <LoadingSkeleton count={3} />
        ) : organizations.length === 0 ? (
          <EmptyState title={`No organizations in ${industry.name}`} description="There are no registered entities in this sector yet." />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((org, i) => (
                <motion.div
                  key={org.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.06, 0.6), duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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