'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getProductById } from '@/services/productService';

const CATEGORIES = ['Food', 'Fitness', 'Tech', 'Services', 'Handloom', 'Electronics'];

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', location: '', whatsapp: '', company_name: '' });

  useEffect(() => {
    if (!params?.id) return;
    async function load() {
      try {
        const product = await getProductById(params.id);
        if (!product) { setError('Product not found'); setLoading(false); return; }
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.id !== product.seller_id) { setError('Not authorized'); setLoading(false); return; }
        setForm({
          name: product.name || '', description: product.description || '',
          price: product.price || '', category: product.category || '',
          location: product.location || '', whatsapp: product.whatsapp || '',
          company_name: product.company_name || '',
        });
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    }
    load();
  }, [params?.id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const res = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, seller_id: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      router.push(`/products/${params.id}`);
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-orange-200 dark:bg-orange-800 rounded-xl" />
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </main>
  );

  if (error) return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{error}</h1>
        <Link href="/dashboard" className="text-orange-600 underline">Back to Dashboard</Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/dashboard" className="hover:text-orange-600 transition">Dashboard</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">Edit Product</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-8">Edit Product</h1>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800/80 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 md:p-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Product Name *</label>
            <input name="name" type="text" required value={form.name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea name="description" rows="4" value={form.description} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Price (₹) *</label>
              <input name="price" type="number" required value={form.price} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category *</label>
              <select name="category" required value={form.category} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none">
                <option value="">Select</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">City</label>
              <input name="location" type="text" value={form.location} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">WhatsApp</label>
              <input name="whatsapp" type="tel" value={form.whatsapp} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Brand/Company</label>
            <input name="company_name" type="text" value={form.company_name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <Link href={`/products/${params.id}`} className="px-6 py-3 rounded-xl font-semibold border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">Cancel</Link>
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20">
              {saving ? 'Saving...' : '✓ Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
