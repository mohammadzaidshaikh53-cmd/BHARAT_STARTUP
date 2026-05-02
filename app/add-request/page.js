'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'   // ← fixed: removed extra }
import { supabase } from '@/lib/supabase'

export default function AddRequest() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    budget: '',
    whatsapp: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        alert('You must be logged in to post a request')
        router.push('/login')
        return
      }

      const whatsappDigits = form.whatsapp.replace(/\D/g, '')
      if (whatsappDigits.length < 10) {
        alert('Please enter a valid WhatsApp number (10 digits minimum)')
        setLoading(false)
        return
      }

      const insertData = {
        title: form.title,
        description: form.description || null,
        category: form.category,
        location: form.location,
        budget: form.budget ? parseInt(form.budget, 10) : null,
        whatsapp: form.whatsapp,
        user_id: user.id,
        is_active: true,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase.from('requests').insert([insertData])
      if (error) throw error

      alert('Request posted successfully!')
      router.push('/')
    } catch (err) {
      console.error(err)
      alert('Error saving request: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Post a Buyer Request</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What do you need? *</label>
            <input
              name="title"
              type="text"
              placeholder="e.g. Organic turmeric powder, 500g pack"
              required
              value={form.title}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              name="description"
              placeholder="Describe what you're looking for in detail..."
              rows="3"
              value={form.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              name="category"
              required
              value={form.category}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-xl"
            >
              <option value="">Select Category</option>
              <option value="Food">Food</option>
              <option value="Fitness">Fitness</option>
              <option value="Tech">Tech</option>
              <option value="Services">Services</option>
              <option value="Handloom">Handloom</option>
              <option value="Electronics">Electronics</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input
              name="location"
              type="text"
              placeholder="e.g. Mumbai, Bangalore, Delhi"
              required
              value={form.location}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₹) *</label>
            <input
              name="budget"
              type="number"
              placeholder="e.g. 5000"
              required
              value={form.budget}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp number *</label>
            <input
              name="whatsapp"
              type="tel"
              placeholder="e.g. 9876543210"
              required
              value={form.whatsapp}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-xl"
            />
            <p className="text-xs text-gray-500 mt-1">Suppliers will contact you on this number</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-full font-medium text-white transition ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-900'
            }`}
          >
            {loading ? 'Posting...' : 'Post Request'}
          </button>
        </form>
      </div>
    </main>
  )
}