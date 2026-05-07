"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import { fetchIndustries } from "../components/data";
import { IndustryCard } from "../components/IndustryCard";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { EmptyState } from "../components/EmptyState";
import { SearchInput } from "../components/SearchInput";
import { PageBackground } from "../components/PageBackground";
import { EcosystemPulse } from "../components/EcosystemPulse";
import { ErrorFallback } from "../components/ErrorFallback";

export default function IndustriesPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['industries'],
    queryFn: fetchIndustries,
  });

  const industries = data?.data || [];
  const totalOrgs = industries.reduce((sum, ind) => sum + (ind.organization_count || 0), 0);

  const filteredIndustries = useMemo(() => {
    if (!search) return industries;
    return industries.filter(ind =>
      ind.name.toLowerCase().includes(search.toLowerCase()) ||
      (ind.description && ind.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, industries]);

  if (error) {
    return <ErrorFallback error={error} resetErrorBoundary={() => refetch()} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#050505] relative">
      <PageBackground variant="industries" />

      <div className="relative bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-black/[0.04] dark:border-white/[0.04] overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(0,60,160,0.035) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(255,153,51,0.025) 0%, transparent 65%)" }} />

        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-100 dark:bg-white/[0.04] rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                <LayoutGrid className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Sector Map</span>
            </div>
            <h1 className="text-4xl md:text-[3.25rem] font-extrabold text-gray-900 dark:text-white tracking-[-0.025em] mb-5 leading-[1.1]">
              Industry Sectors
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed mb-6">
              Navigate the business ecosystem by sector. Explore organizations, trends, and verified firms within specific industries.
            </p>
            <EcosystemPulse items={[
              `${industries.length} economic sectors`,
              `${totalOrgs} total organizations`,
              "Expanding ecosystem",
            ]} />
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="mb-8">
          <SearchInput value={search} onChange={setSearch} placeholder="Search industries..." />
        </div>

        {isLoading ? (
          <LoadingSkeleton count={6} type="industry" />
        ) : filteredIndustries.length === 0 ? (
          <EmptyState title="No industries found" description="Try a different search term to find a sector." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIndustries.map((industry, i) => (
              <motion.div key={industry.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                <IndustryCard industry={industry} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}