"use client";

import { motion } from "framer-motion";

export function EcosystemPulse({ items }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="flex items-center gap-2.5 flex-wrap"
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2.5">
          {i > 0 && <span className="w-[3px] h-[3px] bg-slate-300 dark:bg-slate-700 rounded-full" />}
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 tracking-wide">{item}</span>
        </span>
      ))}
    </motion.div>
  );
}