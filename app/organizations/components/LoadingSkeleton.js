"use client";

import { motion } from "framer-motion";

export function LoadingSkeleton({ count = 3, type = "org" }) {
  return (
    <div className={type === "org" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white/80 dark:bg-[#0f0f10]/80 backdrop-blur-sm rounded-3xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden relative"
        >
          {/* Cover placeholder */}
          <div className="h-32 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-white/[0.04] dark:via-white/[0.02] dark:to-white/[0.04] relative overflow-hidden">
            {/* Shimmer overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/10"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="p-6">
            {/* Avatar placeholder */}
            <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-white/[0.06] mb-4 -mt-10 border-2 border-white dark:border-[#0f0f10] relative z-10" />
            {/* Title placeholder */}
            <div className="h-5 w-3/4 bg-slate-200 dark:bg-white/[0.06] rounded-lg mb-2.5" />
            {/* Description lines */}
            <div className="h-4 w-full bg-slate-100 dark:bg-white/[0.03] rounded-md mb-1.5" />
            <div className="h-4 w-2/3 bg-slate-100 dark:bg-white/[0.03] rounded-md" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}