'use client';

// app/rfq/[id]/quote/page.js — Supplier quote submission page
// TanStack Query v5 migrated (lib/queries/rfqQueries.js)

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRFQDetail, useSubmitQuote } from '@/lib/queries/rfqQueries';
import { hasUserQuoted } from '@/services/rfqService';
import { Container } from '@/components/ui/Container';
import { springConfig } from '@/lib/physics/engine';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatCurrency, getRelativeTime } from '@/lib/utils/formatters';
import { Clock, Package, MapPin, IndianRupee } from 'lucide-react';

export default function SubmitQuotePage() {
  const { id } = useParams();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [hasQuoted, setHasQuoted] = useState(false);
  const [formData, setFormData] = useState({
    price: '',
    unit: 'unit',
    moq: '',
    leadTime: '',
    notes: '',
    deliveryTerms: '',
  });

  const { data: rfqData, isLoading: rfqLoading, error: rfqError } = useRFQDetail(id);
  const submitQuoteMutation = useSubmitQuote();

  useEffect(() => {
    if (!rfqData) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user && rfqData.user_id === data.user.id) {
        toast.error('You cannot quote on your own RFQ');
        router.push('/rfq/' + id);
      }
    });
  }, [rfqData, router, id]);

  useEffect(() => {
    if (!rfqData || rfqError) return;
    hasUserQuoted(id).then(quoted => {
      if (quoted) {
        setHasQuoted(true);
        toast.warning('You have already submitted a quote for this RFQ');
      }
    });
  }, [id, rfqData, rfqError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.price) {
      toast.error('Price is required');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitQuoteMutation.mutateAsync({
        rfqId: id,
        price: formData.price,
        unit: formData.unit,
        moq: formData.moq,
        leadTime: formData.leadTime,
        notes: formData.notes,
        deliveryTerms: formData.deliveryTerms,
      });

      if (result.success) {
        toast.success('Quote submitted successfully!');
        router.push('/dashboard?tab=quotes');
      } else {
        toast.error(result.error || 'Failed to submit quote');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to submit quote');
    } finally {
      setSubmitting(false);
    }
  };

  if (rfqLoading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-orange-200 dark:bg-orange-800 rounded-xl" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </main>
    );
  }

  const rfq = rfqData;
  if (!rfq) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 pb-20 relative z-10">
      <Container className="py-8 max-w-3xl">
        <Link href={'/rfq/' + id} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm">
          Back to RFQ
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfig}
          className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs px-3 py-1 rounded-full font-medium border border-blue-100 dark:border-blue-500/20">
              {rfq.category || 'General'}
            </span>
            <span className="text-xs text-gray-400">{getRelativeTime(rfq.created_at)}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{rfq.title}</h1>
          {rfq.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{rfq.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm">
            {rfq.location && (
              <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" /> {rfq.location}
              </span>
            )}
            {rfq.budget && (
              <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <IndianRupee className="w-4 h-4" /> Budget: {formatCurrency(rfq.budget)}
              </span>
            )}
            {rfq.quantity && (
              <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <Package className="w-4 h-4" /> Qty: {rfq.quantity}
              </span>
            )}
          </div>
        </motion.div>

        {hasQuoted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springConfig}
            className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-6 text-center"
          >
            <div className="text-4xl mb-3">&#128221;</div>
            <h3 className="text-lg font-bold text-amber-800 dark:text-amber-400 mb-2">Quote Already Submitted</h3>
            <p className="text-sm text-amber-700 dark:text-amber-500 mb-4">Check your dashboard to manage your quotes.</p>
            <Link href="/dashboard?tab=quotes" className="inline-block px-4 py-2 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-all">
              View My Quotes
            </Link>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">&#128176;</span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Submit Your Quote</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Your Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Per Unit</label>
                <input
                  type="text"
                  placeholder="e.g., piece, kg"
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">MOQ</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Min order"
                  value={formData.moq}
                  onChange={e => setFormData({ ...formData, moq: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Clock className="w-4 h-4 inline mr-1" />
                Lead Time (days)
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g., 14"
                value={formData.leadTime}
                onChange={e => setFormData({ ...formData, leadTime: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Delivery Terms</label>
              <input
                type="text"
                placeholder="e.g., FOB Mumbai, CIF Delhi"
                value={formData.deliveryTerms}
                onChange={e => setFormData({ ...formData, deliveryTerms: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Additional Notes</label>
              <textarea
                rows={3}
                placeholder="Any additional information..."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/25"
              >
                {submitting ? 'Submitting...' : 'Submit Quote'}
              </button>
            </div>
          </motion.form>
        )}
      </Container>
    </main>
  );
}