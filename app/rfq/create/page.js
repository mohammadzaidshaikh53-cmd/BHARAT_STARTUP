'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createRFQ } from '@/services/rfqService';

const CATEGORIES = ['Food', 'Fitness', 'Tech', 'Services', 'Handloom', 'Electronics'];

export default function CreateRFQPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: '', location: '',
    budget: '', whatsapp: '', quantity: '', urgency: 'medium',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createRFQ(form);
      if (result.success) router.push('/rfq?created=true');
      else alert(result.error || 'Failed to create request');
    } catch (err) { alert('Error: ' + err.message); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/rfq" className="hover:text-blue-600 transition">RFQ Marketplace</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">Post Requirement</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">Post a Buyer Requirement</h1>
        <p className="text-gray-500 mb-8">Describe what you need and let verified suppliers reach out with quotes.</p>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800/80 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 md:p-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">What do you need? *</label>
            <input name="title" type="text" placeholder="e.g. Organic turmeric powder, bulk order" required value={form.title} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Detailed Description</label>
            <textarea name="description" placeholder="Describe specifications, quality requirements..." rows="4" value={form.description} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category *</label>
              <select name="category" required value={form.category} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="">Select Category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location *</label>
              <input name="location" type="text" placeholder="e.g. Mumbai" required value={form.location} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Budget (₹)</label>
              <input name="budget" type="number" placeholder="e.g. 50000" value={form.budget} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
              <input name="quantity" type="text" placeholder="e.g. 100 units" value={form.quantity} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Urgency</label>
            <div className="flex gap-3">
              {[{v:'low',l:'🟢 Low'},{v:'medium',l:'🟡 Medium'},{v:'high',l:'🔴 Urgent'}].map(u => (
                <button key={u.v} type="button" onClick={() => setForm({...form, urgency: u.v})} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.urgency === u.v ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-300 text-blue-700 dark:text-blue-400 ring-2 ring-blue-500/20' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500'}`}>{u.l}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">WhatsApp Number *</label>
            <input name="whatsapp" type="tel" placeholder="e.g. 9876543210" required value={form.whatsapp} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            <p className="text-xs text-gray-500 mt-1.5">Suppliers will contact you on this number</p>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20">
            {loading ? 'Posting...' : '📋 Post Requirement'}
          </button>
        </form>
      </div>
    </main>
  );
}
