"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowUpDown, Award, Fingerprint } from "lucide-react";
import { useOrganizationsInfinite } from "../components/hooks/useOrganizationsInfinite";
import { useDebounce } from "../components/hooks/useDebounce";
import { OrganizationCard } from "../components/OrganizationCard";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { EmptyState } from "../components/EmptyState";
import { SearchInput } from "../components/SearchInput";
import { PageBackground } from "../components/PageBackground";
import { EcosystemPulse } from "../components/EcosystemPulse";
import { ErrorFallback } from "../components/ErrorFallback";

const SORT_OPTIONS = [
  { label: "Highest Trust", value: "trust_desc" },
  { label: "Verification Level", value: "level_desc" },
  { label: "Most Members", value: "members_desc" },
];

const LEGEND_ITEMS = [
  { icon: Fingerprint, title: "Identity Verified", desc: "Legal entity confirmed", iconBg: "bg-emerald-50 dark:bg-emerald-500/10", iconText: "text-emerald-600 dark:text-emerald-400" },
  { icon: Award, title: "Trust Score ≥ 90", desc: "High reputation rating", iconBg: "bg-amber-50 dark:bg-amber-500/10", iconText: "text-amber-600 dark:text-amber-400" },
  { icon: ShieldCheck, title: "Compliance Check", desc: "Regulatory standards met", iconBg: "bg-indigo-50 dark:bg-indigo-500/10", iconText: "text-indigo-600 dark:text-indigo-400" },
];

export default function VerifiedOrganizationsPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("trust_desc");
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
    verifiedOnly: true, // ← only verified organizations
    sortBy: sort,
  });

  const organizations = data?.pages.flatMap(page => page.data) || [];
  const totalCount = data?.pages[0]?.count || 0;
  const avgTrust = organizations.length > 0 
    ? Math.round(organizations.reduce((s, o) => s + (o.trust_score ?? 0), 0) / organizations.length) 
    : 0;

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
  }, [debouncedSearch, sort]);

  if (error) {
    return <ErrorFallback error={error} resetErrorBoundary={() => refetch()} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#050505] pb-20 relative">
      <PageBackground variant="verified" />

      {/* Premium Header — navy-emerald institutional atmosphere */}
      <div className="relative overflow-hidden border-b border-emerald-500/10 dark:border-emerald-500/5" style={{ background: "linear-gradient(175deg, #071a2e 0%, #0a1628 30%, #0d1f3c 60%, #064e3b 100%)" }}>
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.1) 0%, transparent 60%)" }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(255,153,51,0.04) 0%, transparent 60%)" }} />
        {/* Subtle geometric texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-[0.12em] mb-7 backdrop-blur-md" style={{ background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.2)", color: "#6ee7b7" }}>
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Trust Network
            </div>
            <h1 className="text-4xl md:text-[3.25rem] font-extrabold text-white tracking-[-0.025em] mb-5 leading-[1.1]">
              Institutional Trust Directory
            </h1>
            <p className="text-lg max-w-2xl leading-relaxed mb-6" style={{ color: "rgba(167,243,208,0.5)" }}>
              An exclusive directory of organizations that have passed rigorous institutional checks, identity verification, and compliance reviews.
            </p>
            <EcosystemPulse items={[
              `${totalCount} verified firms`,
              `Avg trust: ${avgTrust}`,
              `Institutional grade`,
            ]} />
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10 -mt-8">
        {/* Trust Legend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {LEGEND_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/90 dark:bg-[#0f0f10]/90 backdrop-blur-2xl border border-black/[0.05] dark:border-white/[0.05] p-5 rounded-2xl flex items-center gap-5 shadow-[0_2px_16px_rgba(0,0,0,0.02)]"
            >
              <div className={`p-2.5 rounded-xl ${item.iconBg} ${item.iconText}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</h4>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <SearchInput value={search} onChange={setSearch} placeholder="Search verified firms..." />
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-white/90 dark:bg-[#0f0f10]/90 backdrop-blur-xl border border-black/[0.05] dark:border-white/[0.05] rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 outline-none shadow-sm cursor-pointer font-medium"
            >
              {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {isLoading && !organizations.length ? (
          <LoadingSkeleton count={3} />
        ) : organizations.length === 0 ? (
          <EmptyState title="No verified organizations found" description="No entities match your search criteria within the verified trust layer." />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {organizations.map((org, i) => (
                <motion.div
                  key={org.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.06, 0.6), duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <OrganizationCard org={org} trustFocus={true} />
                </motion.div>
              ))}
            </div>
            {hasNextPage && (
              <div ref={lastElementRef} className="h-10 mt-8 flex justify-center">
                {isFetchingNextPage && (
                  <div className="py-4 text-center text-slate-400 dark:text-slate-500 text-sm">
                    Loading more verified firms...
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