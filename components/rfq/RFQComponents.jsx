/**
 * RFQ (Request for Quote) Components
 * Pattern from: Alibaba RFQ, IndiaMART Lead Management
 *
 * Features:
 * - RFQ creation form
 * - Quote comparison
 * - Status tracking
 * - Workflow management
 */

'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  MessageSquare,
  Send,
  DollarSign,
  Package,
  Calendar,
  ChevronRight,
  Filter,
  Plus,
  ArrowRight,
  X,
} from 'lucide-react';
import { PhysicsCard, ScrollReveal } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

/**
 * RFQ Card
 */
export function RFQCard({
  rfq,
  onView,
  className = '',
}) {
  const {
    id,
    title,
    description,
    quantity,
    unit,
    budget,
    deadline,
    status,
    responses,
    createdAt,
    category,
  } = rfq;

  const statusConfig = {
    open: { label: 'Open', color: 'bg-blue-500', textColor: 'text-blue-600' },
    reviewing: { label: 'Reviewing', color: 'bg-amber-500', textColor: 'text-amber-600' },
    closed: { label: 'Closed', color: 'bg-gray-500', textColor: 'text-gray-600' },
    awarded: { label: 'Awarded', color: 'bg-emerald-500', textColor: 'text-emerald-600' },
  };

  const statusInfo = statusConfig[status] || statusConfig.open;

  return (
    <PhysicsCard
      onClick={() => onView?.(id)}
      className={`card-premium p-5 cursor-pointer ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color} text-white`}>
              {statusInfo.label}
            </span>
            <span className="text-xs text-muted-foreground">{category}</span>
          </div>
          <h3 className="font-semibold text-lg truncate">{title}</h3>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-primary">{budget}</p>
          <p className="text-xs text-muted-foreground">Budget</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{description}</p>

      {/* Meta */}
      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Package className="w-3 h-3" />
          <span>{quantity} {unit}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Due {deadline}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          <span>{responses} quotes</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Posted {createdAt}
        </span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </PhysicsCard>
  );
}

/**
 * RFQ Creation Form
 */
export function RFQForm({
  onSubmit,
  loading = false,
  className = '',
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    quantity: '',
    unit: 'units',
    budget: '',
    budgetType: 'range',
    deadline: '',
    preferredSupplier: '',
    attachments: [],
  });

  const categories = [
    'Electronics',
    'Machinery',
    'Textiles',
    'Chemicals',
    'Food & Beverage',
    'Automotive',
    'Construction',
    'Other',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          RFQ Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="What are you looking for?"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="">Select category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your requirements in detail..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          required
        />
      </div>

      {/* Quantity & Unit */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
            placeholder="1000"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Unit</label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="units">Units</option>
            <option value="kg">Kilograms</option>
            <option value="tons">Tons</option>
            <option value="pieces">Pieces</option>
            <option value="boxes">Boxes</option>
            <option value="liters">Liters</option>
          </select>
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Budget <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={formData.budget}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
              placeholder={formData.budgetType === 'range' ? '50000 - 100000' : '50000'}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <select
            value={formData.budgetType}
            onChange={(e) => setFormData(prev => ({ ...prev, budgetType: e.target.value }))}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <option value="fixed">Fixed</option>
            <option value="range">Range</option>
            <option value="negotiable">Negotiable</option>
          </select>
        </div>
      </div>

      {/* Deadline */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Delivery Deadline</label>
        <input
          type="date"
          value={formData.deadline}
          onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4 pt-4">
        <Button type="button" variant="outline" className="flex-1">
          Save Draft
        </Button>
        <Button type="submit" loading={loading} className="flex-1 gap-2">
          <Send className="w-4 h-4" />
          Post RFQ
        </Button>
      </div>
    </form>
  );
}

/**
 * Quote Comparison Table
 */
export function QuoteComparison({
  quotes = [],
  onAccept,
  onReject,
  className = '',
}) {
  if (quotes.length === 0) {
    return (
      <div className="card-premium p-8 text-center">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground/30" />
        <h3 className="mt-4 font-semibold">No quotes yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Suppliers will respond to your RFQ soon
        </p>
      </div>
    );
  }

  return (
    <div className={`card-premium overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-semibold">Quote Comparison</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {quotes.length} suppliers have quoted
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                Supplier
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                Price
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                Lead Time
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                MOQ
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                Rating
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {quotes.map((quote) => (
              <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={quote.supplier?.logo}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium">{quote.supplier?.name}</p>
                      <p className="text-xs text-muted-foreground">{quote.supplier?.location}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="font-bold text-primary">{quote.price}</p>
                  <p className="text-xs text-muted-foreground">per unit</p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm">{quote.leadTime}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm">{quote.moq}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{quote.rating}</span>
                    <span className="text-amber-400">★</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => onAccept?.(quote.id)}>
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onReject?.(quote.id)}>
                      Reject
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * RFQ Status Timeline
 */
export function RFQStatusTimeline({
  statuses = [],
  className = '',
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {statuses.map((status, index) => {
        const isCompleted = status.completed;
        const isCurrent = status.current;

        return (
          <motion.div
            key={status.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...springTransition, delay: index * 0.1 }}
            className="flex gap-4"
          >
            {/* Timeline */}
            <div className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-muted-foreground'}
              `}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              {index < statuses.length - 1 && (
                <div className={`w-0.5 flex-1 ${isCompleted ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <p className={`font-medium ${isCurrent ? 'text-foreground' : isCompleted ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                {status.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{status.description}</p>
              {status.date && (
                <p className="text-xs text-muted-foreground mt-1">{status.date}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
