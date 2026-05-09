'use client';

// app/rfq/[id]/page.js — RFQ detail page with quote comparison (buyer view)
// TanStack Query v5 migrated (lib/queries/rfqQueries.js)

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRFQDetail, useQuotesForRFQ, useUpdateQuoteStatus, useAwardQuote } from '@/lib/queries/rfqQueries';
import { Container } from '@/components/ui/Container';
import TrustBadge from '@/components/trust/TrustBadge';
import { springConfig, staggerDelay } from '@/lib/physics/engine';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatCurrency, getRelativeTime } from '@/lib/utils/formatters';
import { MapPin, Package, IndianRupee, Clock, CheckCircle2, XCircle, Star, Award, MessageSquare } from 'lucide-react';

const QUOTE_STATUS_LABELS = {
  submitted: { label: 'New', color: 'blue', icon: '📨' },
  shortlisted: { label: 'Shortlisted', color: 'emerald', icon: '⭐' },
  rejected: { label: 'Rejected', color: 'red', icon: '✗' },
  awarded: { label: 'Awarded', color: 'amber', icon: '🏆' },
};

function getTrustBadge(trustScore, verificationStatus) {
  if (verificationStatus === 'verified' && trustScore >= 70) return { label: 'Trusted', icon: '🛡️', color: 'emerald' };
  if (verificationStatus === 'verified') return { label: 'Verified', icon: '✓', color: 'green' };
  if (trustScore >= 60) return { label: 'Active', icon: '⚡', color: 'blue' };
  return { label: 'New', icon: '🌱', color: 'amber' };
}

// QuoteCard with shortlist, reject, award actions
function QuoteCard({ quote, index, onShortlist, onReject, onAward, isOwner }) {
  const [isHovered, setIsHovered] = useState(false);
  const supplier = quote.supplier || {};
  const trustBadge = getTrustBadge(supplier.trust_score || 0, supplier.verification_status);
  const statusInfo = QUOTE_STATUS_LABELS[quote.status] || QUOTE_STATUS_LABELS.submitted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springConfig, delay: staggerDelay(index, 0.08) }}
      whileHover={{ y: -4, transition: springConfig }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white dark:bg-gray-800/80 rounded-2xl border p-5 transition-all duration-300 ${
        isHovered ? 'shadow-xl shadow-blue-500/10 border-blue-200 dark:border-blue-500/30' : 'border-gray-100 dark:border-gray-700/50'
      } ${quote.status === 'awarded' ? 'ring-2 ring-amber-400' : ''}`}
    >
      {quote.status !== 'submitted' && (
        <div className="flex items-center gap-1.5 text-xs font-semibold mb-3">
          <span>{statusInfo.icon}</span>
          <span className={`px-2 py-0.5 rounded-full bg-${statusInfo.color}-100 dark:bg-${statusInfo.color}-500/10 text-${statusInfo.color}-700 dark:text-${statusInfo.color}-400`}>
            {statusInfo.label}
          </span>
        </div>
      )}

      {/* Supplier info */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {(supplier.company_name || supplier.full_name || '?')[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate">{supplier.company_name || supplier.full_name || 'Unknown'}</h4>
            <TrustBadge badge={trustBadge} size="xs" />
          </div>
          {supplier.full_name && supplier.company_name && (
            <p className="text-xs text-gray-500 truncate">{supplier.full_name}</p>
          )}
          {quote.created_at && (
            <p className="text-xs text-gray-400 mt-0.5">{getRelativeTime(quote.created_at)}</p>
          )}
        </div>
      </div>

      {/* Quote details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
          <div className="text-lg font-black text-emerald-600">₹{Number(quote.price || 0).toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-gray-500">per {quote.unit || 'unit'}</div>
        </div>
        {quote.moq && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
            <div className="text-lg font-black text-blue-600">{quote.moq}</div>
            <div className="text-[10px] text-gray-500">MOQ</div>
          </div>
        )}
        {quote.lead_time_days && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
            <div className="text-lg font-black text-purple-600">{quote.lead_time_days}</div>
            <div className="text-[10px] text-gray-500">days lead</div>
          </div>
        )}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
          <div className="text-lg font-black text-gray-600 dark:text-gray-400">{supplier.trust_score || 0}</div>
          <div className="text-[10px] text-gray-500">trust</div>
        </div>
      </div>

      {/* Notes */}
      {quote.notes && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{quote.notes}</p>
        </div>
      )}

      {/* Delivery terms */}
      {quote.delivery_terms && (
        <p className="text-xs text-gray-500 mb-4">📦 {quote.delivery_terms}</p>
      )}

      {/* Actions */}
      {isOwner && quote.status === 'submitted' && (
        <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700/50">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onShortlist(quote.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all"
          >
            <Star className="w-4 h-4" /> Shortlist
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAward(quote)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-all"
          >
            <Award className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onReject(quote.id)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <XCircle className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

export default function RFQDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  const { data: rfqData, isLoading: rfqLoading, error: rfqError } = useRFQDetail(id);
  const { data: quotesData, isLoading: quotesLoading } = useQuotesForRFQ(id);
  const updateStatus = useUpdateQuoteStatus();
  const awardQuote = useAwardQuote();

  const rfq = rfqData || null;
  const quotes = quotesData?.quotes || [];

  useEffect(() => {
    if (rfqError) {
      toast.error(rfqError?.message || 'Failed to load RFQ');
      router.push('/rfq');
    }
  }, [rfqError, router]);

  const handleShortlist = async (quoteId) => {
    try {
      const result = await updateStatus.mutateAsync({ quoteId, status: 'shortlisted' });
      if (result.success) {
        toast.success('Supplier shortlisted');
      } else {
        toast.error(result.error || 'Failed to shortlist');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to shortlist');
    }
  };

  const handleReject = async (quoteId) => {
    if (!confirm('Reject this quote?')) return;
    try {
      const result = await updateStatus.mutateAsync({ quoteId, status: 'rejected' });
      if (result.success) {
        toast.success('Quote rejected');
      } else {
        toast.error(result.error || 'Failed to reject');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to reject');
    }
  };

  const handleAward = async (quote) => {
    if (!confirm(`Award this RFQ to ${quote.supplier?.company_name || quote.supplier?.full_name || 'this supplier'}? This will close the RFQ and reject other quotes.`)) return;
    try {
      const result = await awardQuote.mutateAsync(quote.id);
      if (result.success) {
        toast.success('RFQ awarded! The supplier has been notified.');
      } else {
        toast.error(result.error || 'Failed to award');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to award');
    }
  };

  if (rfqLoading || quotesLoading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-xl" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </main>
    );
  }

  if (!rfq) return null;

  const isOwner = user && rfq.user_id === user.id;
  const shortlisted = quotes.filter(q => q.status === 'shortlisted');
  const submitted = quotes.filter(q => q.status === 'submitted');

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 pb-20 relative z-10">
      <Container className="py-8 max-w-5xl">
        <Link href="/rfq" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm">
          Back to RFQs
        </Link>

        {/* RFQ Header */}
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
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rfq.is_active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-gray-100 text-gray-500'}`}>
              {rfq.is_active ? '🟢 Active' : '⚪ Closed'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{rfq.title}</h1>
          {rfq.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{rfq.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm">
            {rfq.location && <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400"><MapPin className="w-4 h-4" /> {rfq.location}</span>}
            {rfq.budget && <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400"><IndianRupee className="w-4 h-4" /> Budget: {formatCurrency(rfq.budget)}</span>}
            {rfq.quantity && <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400"><Package className="w-4 h-4" /> Qty: {rfq.quantity}</span>}
            <span className="flex items-center gap-1.5 text-gray-400"><Clock className="w-4 h-4" /> {getRelativeTime(rfq.created_at)}</span>
          </div>
          {isOwner && rfq.is_active && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
              <button
                onClick={() => router.push('/rfq/' + id + '/edit')}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Edit RFQ
              </button>
            </div>
          )}
        </motion.div>

        {/* Quotes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Quotes Received
              <span className="text-sm font-normal text-gray-500">({quotes.length})</span>
            </h2>
          </div>

          {quotes.length === 0 ? (
            <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-12 text-center">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">No quotes yet</h3>
              <p className="text-sm text-gray-500 mb-4">Suppliers will submit quotes once they see your requirements.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Shortlisted */}
              {shortlisted.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-emerald-600 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" /> Shortlisted ({shortlisted.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {shortlisted.map((quote, idx) => (
                      <QuoteCard
                        key={quote.id}
                        quote={quote}
                        index={idx}
                        onShortlist={handleShortlist}
                        onReject={handleReject}
                        onAward={handleAward}
                        isOwner={isOwner}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* New quotes */}
              {submitted.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> New ({submitted.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {submitted.map((quote, idx) => (
                      <QuoteCard
                        key={quote.id}
                        quote={quote}
                        index={idx}
                        onShortlist={handleShortlist}
                        onReject={handleReject}
                        onAward={handleAward}
                        isOwner={isOwner}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Rejected */}
              {quotes.filter(q => q.status === 'rejected').length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-red-500 mb-3">Rejected ({quotes.filter(q => q.status === 'rejected').length})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                    {quotes.filter(q => q.status === 'rejected').map((quote, idx) => (
                      <QuoteCard
                        key={quote.id}
                        quote={quote}
                        index={idx}
                        onShortlist={handleShortlist}
                        onReject={handleReject}
                        onAward={handleAward}
                        isOwner={isOwner}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </Container>
    </main>
  );
}