"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, Users, Star, MapPin, ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { TIER_STYLES } from "./styles";
import { getActivityState, getTrustTrend } from "./helpers";
import { useTrustSparkline } from "./hooks/useTrustSparkline";
import { subscribeToTrustUpdates } from "./data";
import { useEffect, useState } from "react";

export function OrganizationCard({ org, trustFocus = false }) {
  const [liveScore, setLiveScore] = useState(org.trust_score ?? org.reputation_score ?? 0);
  const [trustHistory, setTrustHistory] = useState(org.trust_history || []);
  
  const isVerified = org.verification_status === "verified";
  const activity = getActivityState(org);
  const trend = getTrustTrend(trustHistory);
  const tierStyle = TIER_STYLES[org.trust_tier] || TIER_STYLES.unrated;
  const hasTier = org.trust_tier && org.trust_tier !== "unrated";

  const displayLocation = org.location || (org.city && org.country ? `${org.city}, ${org.country}` : org.city || org.country || null);
  const sparklineId = `spark-${org.id}`;
  
  // Render sparkline
  useTrustSparkline(sparklineId, trustHistory, { color: trustFocus ? '#10b981' : '#6366f1' });

  // Real‑time trust subscription
  useEffect(() => {
    const unsubscribe = subscribeToTrustUpdates(org.id, (newTrustScore) => {
      setLiveScore(newTrustScore);
      // Optionally update history or re-fetch
    });
    return unsubscribe;
  }, [org.id]);

  const TrendIcon = trend?.icon === "▲" ? TrendingUp : trend?.icon === "▼" ? TrendingDown : Minus;
  const trendColor = trend?.color || "text-slate-400";

  const coverBg = org.is_premium
    ? "radial-gradient(ellipse at 20% 50%, rgba(255,153,51,0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(0,40,120,0.04) 0%, transparent 50%), linear-gradient(135deg, #f8fafc, #f1f5f9, #f8fafc)"
    : "radial-gradient(ellipse at 30% 50%, rgba(100,116,139,0.03) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(100,116,139,0.015) 0%, transparent 50%), linear-gradient(135deg, #f8fafc, #f1f5f9, #f8fafc)";

  const coverDarkBg = org.is_premium
    ? "radial-gradient(ellipse at 20% 50%, rgba(255,153,51,0.03) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(30,58,138,0.04) 0%, transparent 50%), linear-gradient(135deg, #1a1a1a, #111111, #1a1a1a)"
    : "radial-gradient(ellipse at 30% 50%, rgba(100,116,139,0.02) 0%, transparent 50%), linear-gradient(135deg, #1a1a1a, #111111, #1a1a1a)";

  const hoverShadow = trustFocus
    ? "0 24px 48px rgba(0,0,0,0.06), 0 0 0 1px rgba(16,185,129,0.06)"
    : org.is_premium
    ? "0 24px 48px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,153,51,0.04)"
    : "0 24px 48px rgba(0,0,0,0.05)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } }}
      className="group relative flex flex-col bg-white/85 dark:bg-[#0f0f10]/85 backdrop-blur-2xl border border-black/[0.05] dark:border-white/[0.05] rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.02)] hover:border-black/[0.08] dark:hover:border-white/[0.08] transition-all duration-500"
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = hoverShadow; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 20px rgba(0,0,0,0.02)"; }}
    >
      {/* Cover */}
      <div className="h-32 w-full relative overflow-hidden dark:hidden" style={{ background: coverBg }}>
        {org.cover_image_url && <img src={org.cover_image_url} alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 ease-out" />}
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
        {isVerified && trustFocus && (
          <div className="absolute top-3 right-3 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] flex items-center gap-1.5 z-10">
            <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Verified
          </div>
        )}
      </div>
      <div className="h-32 w-full relative overflow-hidden hidden dark:block" style={{ background: coverDarkBg }}>
        {org.cover_image_url && <img src={org.cover_image_url} alt="" className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700 ease-out" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f10]/95 via-[#0f0f10]/30 to-transparent" />
        {isVerified && trustFocus && (
          <div className="absolute top-3 right-3 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] flex items-center gap-1.5 z-10">
            <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Verified
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col relative -mt-8">
        {/* Logo + Tier + Trend */}
        <div className="flex items-end justify-between mb-4">
          <div className="relative">
            <div className={`w-16 h-16 rounded-2xl bg-white dark:bg-[#1a1a1a] border-2 border-white dark:border-[#0f0f10] shadow-lg overflow-hidden flex items-center justify-center transition-colors duration-300 ${isVerified ? "group-hover:border-emerald-100 dark:group-hover:border-emerald-500/20" : "group-hover:border-indigo-50 dark:group-hover:border-indigo-500/20"}`}>
              {org.logo_url ? (
                <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-slate-400 dark:text-slate-600">{org.name.charAt(0)}</span>
              )}
            </div>
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-indigo-600 dark:bg-indigo-500 text-white p-0.5 rounded-full border-2 border-white dark:border-[#0f0f10] shadow-sm">
                <ShieldCheck className="w-3 h-3" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {trend && (
              <div className={`flex items-center gap-1 text-[11px] font-medium ${trendColor}`}>
                <TrendIcon className="w-3 h-3" />
                <span>{trend.value}</span>
              </div>
            )}
            {hasTier && (
              <motion.span
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ ...tierStyle, backgroundSize: "200% 200%" }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-[0.08em] shadow-sm"
              >
                {org.trust_tier}
              </motion.span>
            )}
          </div>
        </div>

        {/* Name + Location */}
        <Link href={`/organizations/${org.slug}`} className="flex-1 group/link">
          <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-1 group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400 transition-colors duration-200 line-clamp-1 tracking-[-0.01em]">
            {org.name}
          </h3>
          {displayLocation && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-3">
              <MapPin className="w-3 h-3" />
              <span>{displayLocation}</span>
            </div>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
            {org.description}
          </p>
        </Link>

        {/* Sparkline */}
        <div id={sparklineId} className="h-8 w-full mb-2" />

        {/* Activity State */}
        {activity && (
          <div className={`flex items-center gap-1.5 text-[11px] font-medium mb-3 ${activity.text}`}>
            <motion.span
              animate={{ opacity: [0.35, 0.85, 0.35] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className={`w-[5px] h-[5px] rounded-full ${activity.dot}`}
            />
            {activity.label}
          </div>
        )}

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {org.industry_name && (
            <span className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100/80 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 rounded-lg">
              {org.industry_name}
            </span>
          )}
          {org.is_premium && (
            <span className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-100/80 dark:border-indigo-500/20">
              Premium
            </span>
          )}
        </div>

        {/* Stats with live trust score */}
        <div className="flex items-center justify-between pt-4 border-t border-black/[0.04] dark:border-white/[0.04] text-xs text-gray-400 dark:text-gray-500 mt-auto">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium"><Users className="w-3.5 h-3.5" /> {org.member_count ?? 0}</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span className={liveScore > (org.trust_score ?? 0) ? 'text-emerald-500' : liveScore < (org.trust_score ?? 0) ? 'text-red-500' : ''}>
                {liveScore}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Link
        href={`/organizations/${org.slug}`}
        className="block bg-slate-50/40 dark:bg-white/[0.015] px-6 py-3.5 text-sm font-semibold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-500/[0.06] transition-all duration-200 flex items-center justify-between border-t border-black/[0.04] dark:border-white/[0.04]"
      >
        View Profile <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
      </Link>
    </motion.div>
  );
}