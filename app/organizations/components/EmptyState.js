"use client";

import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

export function EmptyState({ title, description, icon: Icon = Building2 }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center px-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border border-black/[0.04] dark:border-white/[0.04]"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,153,51,0.04) 0%, rgba(248,250,252,1) 70%)" }}
      >
        <Icon className="w-9 h-9 text-slate-300 dark:text-slate-600" />
      </motion.div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-400 dark:text-slate-500 max-w-md leading-relaxed text-[15px]">{description}</p>
    </div>
  );
}