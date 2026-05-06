// components/sections/marketplace/TrendingStrip.js
'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import { ChevronRight, MapPin, Package, ShieldCheck } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';

const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const StarRating = ({ rating = 4.5 }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-3 h-3 ${i < full ? 'fill-yellow-400 text-yellow-400' : (i === full && half ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600')}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
      ))}
    </div>
  );
};

export default function TrendingStrip({ products }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const router = useRouter();

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-12">
          <SectionHeader eyebrow="Curated" title="Trending this week" />
          <Link href="/marketplace/trending" className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: 40 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="flex gap-6 overflow-x-auto pb-8 px-4 sm:px-6 max-w-7xl mx-auto scrollbar-hide snap-x snap-mandatory"
      >
        {products.slice(0, 8).map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300 } }}
            onClick={() => router.push(`/products/${product.id}`)}
            className="group relative flex-shrink-0 w-[260px] snap-start cursor-pointer"
          >
            <div className="relative h-[200px] rounded-2xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
              {product.image_url ? (
                <motion.img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.5 }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 left-3 right-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <p className="text-white font-semibold text-sm truncate">{product.name}</p>
                <p className="text-white/80 text-xs">{formatCurrency(product.price)}</p>
              </div>
              {product.verification_status === 'verified' && (
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px] font-medium">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </div>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-orange-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {product.location || 'India'}
              </p>
              <StarRating rating={4 + (i % 2) * 0.5} />
            </div>
          </motion.div>
        ))}
      </motion.div>
      <style jsx global>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </section>
  );
}