'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AddProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    location: '',
    whatsapp: '',
    company_name: '',
  })
  const [imageFile, setImageFile] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageUpload = async () => {
    if (!imageFile) return null

    // File validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(imageFile.type)) {
      alert('Only JPG, PNG, and WEBP images are allowed')
      return null
    }
    if (imageFile.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB')
      return null
    }

    const fileName = `${Date.now()}_${imageFile.name}`
    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile, { upsert: true })
    if (error) {
      alert('Image upload failed. Please try again.')
      return null
    }
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // ✅ Get current logged‑in user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('You must be logged in to add a product')
        setLoading(false)
        return
      }

      let imageUrl = null
      if (imageFile) {
        imageUrl = await handleImageUpload()
        if (!imageUrl) {
          setLoading(false)
          return
        }
      }

      const insertData = {
        name: formData.name,
        description: formData.description,
        price: Math.max(0, Number(formData.price)),
        category: formData.category,
        location: formData.location,
        whatsapp: formData.whatsapp,
        company_name: formData.company_name || null,
        seller_id: user.id,
        verified: false,
        created_at: new Date().toISOString(),
      }
      if (imageUrl) {
        insertData.image_url = imageUrl
      }

      const { error } = await supabase.from('products').insert([insertData])
      if (error) throw error

      // Clear form after success
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        location: '',
        whatsapp: '',
        company_name: '',
      })
      setImageFile(null)

      router.push('/')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Add Your Product</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product name *</label>
            <input
              name="name"
              type="text"
              placeholder="e.g. Organic Turmeric Powder"
              required
              onChange={handleChange}
              value={formData.name}
              className="w-full p-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              placeholder="Describe your product, key features, benefits..."
              required
              rows="4"
              onChange={handleChange}
              value={formData.description}
              className="w-full p-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
            <input
              name="price"
              type="number"
              placeholder="e.g. 499"
              required
              onChange={handleChange}
              value={formData.price}
              className="w-full p-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              name="category"
              required
              onChange={handleChange}
              value={formData.category}
              className="w-full p-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              name="location"
              type="text"
              placeholder="e.g. Mumbai, Pune, Bangalore"
              required
              onChange={handleChange}
              value={formData.location}
              className="w-full p-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp number *</label>
            <input
              name="whatsapp"
              type="tel"
              placeholder="e.g. 9876543210 (with or without +91)"
              required
              onChange={handleChange}
              value={formData.whatsapp}
              className="w-full p-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="text-xs text-gray-500 mt-1">Buyers will contact you on this number</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Startup/Brand name (optional)</label>
            <input
              name="company_name"
              type="text"
              placeholder="Your startup or brand name"
              onChange={handleChange}
              value={formData.company_name}
              className="w-full p-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image (recommended)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
            <p className="text-xs text-gray-500 mt-1">JPEG, PNG, or WEBP. Max 2MB.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-full font-medium text-white transition ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Publishing...' : 'Publish Product'}
          </button>
        </form>
      </div>
    </main>
  )
}