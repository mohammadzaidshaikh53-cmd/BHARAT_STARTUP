"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";
import { INDUSTRY_STYLES } from "./styles";
import { getSectorMomentum } from "./helpers";

export function IndustryCard({ industry }) {
  const styles = INDUSTRY_STYLES[industry.slug] || INDUSTRY_STYLES.manufacturing;
  const momentum = getSectorMomentum(industry.organization_count);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } }}
      className="h-full"
    >
      <Link
        href={`/organizations/industries/${industry.slug}`}
        className="block h-full bg-white/85 dark:bg-[#0f0f10]/85 backdrop-blur-2xl border border-black/[0.05] dark:border-white/[0.05] p-6 rounded-3xl group hover:border-black/[0.08] dark:hover:border-white/[0.08] transition-all duration-500 relative overflow-hidden"
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.05), 0 0 60px ${styles.glow}`; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
      >
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-6">
            <div className={`p-3 rounded-2xl ${styles.iconBg} transition-all duration-300`}>
              <Building2 className={`w-6 h-6 ${styles.iconText} opacity-70`} />
            </div>
            <div className="p-1.5 rounded-full bg-slate-100/80 dark:bg-white/[0.04] text-slate-400 dark:text-slate-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-all duration-300">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 tracking-[-0.01em]">
            {industry.name}
          </h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 line-clamp-2 mb-6 flex-1 leading-relaxed">
            {industry.description}
          </p>

          <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
            <span className={`text-[11px] font-medium ${momentum.text}`}>{momentum.label}</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white bg-slate-100/80 dark:bg-white/[0.04] px-2.5 py-1 rounded-lg">
              {industry.organization_count}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}