// components/sections/social/RequestsTicker.js
'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin } from 'lucide-react';

const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const getRelativeTime = (ts) => {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d === 1) return 'Yesterday';
  return `${d}d ago`;
};

export default function RequestsTicker({ requests }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const speed = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const doubled = [...requests, ...requests];
  if (requests.length === 0) return null;

  return (
    <section ref={ref} className="py-20 bg-gray-900 dark:bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10 relative">
        <div className="flex items-center gap-3 mb-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
          </span>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-orange-400">Live Requests</h3>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Buyers are looking right now</h2>
      </div>
      <div className="relative overflow-hidden">
        <motion.div style={{ x: speed }} className="flex gap-5 w-max">
          {doubled.map((req, i) => (
            <div key={`${req.id}-${i}`} className="flex-shrink-0 w-[320px] p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full">{req.category}</span>
                <span className="text-[11px] text-gray-400">{getRelativeTime(req.created_at)}</span>
              </div>
              <h4 className="text-sm font-semibold text-white mb-2 line-clamp-2">{req.title}</h4>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Budget: <span className="text-white font-medium">{formatCurrency(req.budget)}</span></span>
                <span className="flex items-center gap-1 text-[10px] text-gray-500"><MapPin className="w-3 h-3" /> {req.location}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}