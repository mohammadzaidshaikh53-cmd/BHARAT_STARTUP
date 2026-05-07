export function getActivityState(org) {
  if (org.trust_score >= 95 && org.verification_status === "verified") 
    return { label: "Recently active", dot: "bg-emerald-500", text: "text-emerald-600/50 dark:text-emerald-400/40", pulse: true };
  if (org.member_count >= 100) 
    return { label: "Growing network", dot: "bg-blue-500", text: "text-blue-600/50 dark:text-blue-400/40", pulse: false };
  if (org.trust_score >= 85 && org.verification_status === "verified") 
    return { label: "Institutional presence", dot: "bg-indigo-500", text: "text-indigo-600/50 dark:text-indigo-400/40", pulse: false };
  if (org.verification_status === "verified") 
    return { label: "Verified entity", dot: "bg-slate-400", text: "text-slate-500/50 dark:text-slate-400/40", pulse: false };
  return null;
}

export function getSectorMomentum(count) {
  if (count >= 200) 
    return { label: "High institutional density", text: "text-emerald-600/40 dark:text-emerald-400/30", icon: "🔥" };
  if (count >= 80) 
    return { label: "Strong trust network", text: "text-blue-600/40 dark:text-blue-400/30", icon: "⚡" };
  if (count >= 40) 
    return { label: "Emerging ecosystem", text: "text-amber-600/40 dark:text-amber-400/30", icon: "🌱" };
  return { label: "Developing sector", text: "text-slate-500/40 dark:text-slate-400/30", icon: "🌿" };
}

export function getTrustTrend(history) {
  if (!history || history.length < 2) return null;
  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  const diff = last - prev;
  if (diff > 0) return { icon: "▲", color: "text-emerald-500", label: "rising", value: `+${diff}` };
  if (diff < 0) return { icon: "▼", color: "text-red-500", label: "falling", value: `${diff}` };
  return { icon: "●", color: "text-slate-400", label: "stable", value: "0" };
}