'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getRFQById } from '@/services/rfqService';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function EditRFQPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    budget: '',
    whatsapp: '',
    quantity: '',
    delivery_timeline: '',
    urgency: 'normal'
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const rfq = await getRFQById(id);
      if (!rfq) {
        toast.error('RFQ not found');
        router.push('/rfq');
        return;
      }

      if (rfq.user_id !== user.id) {
        toast.error('Unauthorized');
        router.push('/rfq');
        return;
      }

      setFormData({
        title: rfq.title || '',
        description: rfq.description || '',
        category: rfq.category || '',
        location: rfq.location || '',
        budget: rfq.budget || '',
        whatsapp: rfq.whatsapp || '',
        quantity: rfq.quantity || '',
        delivery_timeline: rfq.delivery_timeline || '',
        urgency: rfq.urgency || 'normal'
      });
      setLoading(false);
    }
    load();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('requests')
        .update({
          ...formData,
          budget: formData.budget ? parseInt(formData.budget) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('RFQ updated successfully');
      router.push(`/rfq/${id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Loading RFQ...</div>;

  return (
    <Container className="py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Edit Buyer Request (RFQ)</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            required
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Quantity Required</label>
            <input
              type="text"
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Target Budget (₹)</label>
            <input
              type="number"
              value={formData.budget}
              onChange={e => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
    </Container>
  );
}
