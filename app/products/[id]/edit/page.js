'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function EditProductPage({ params }) {
  const router = useRouter()
  const unwrappedParams = React.use(params)
  const productId = unwrappedParams.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    location: '',
    whatsapp: '',
    company_name: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [currentImageUrl, setCurrentImageUrl] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error || !data) {
        alert('Product not found')
        router.push('/dashboard')
        return
      }

      if (data.seller_id !== user.id) {
        alert('You can only edit your own products')
        router.push('/dashboard')
        return
      }

      setForm({
        name: data.name || '',
        description: data.description || '',
        price: data.price || '',
        category: data.category || '',
        location: data.location || '',
        whatsapp: data.whatsapp || '',
        company_name: data.company_name || '',
      })
      setCurrentImageUrl(data.image_url || null)
      setLoading(false)
    }

    fetchProduct()
  }, [productId, router])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageUpload = async () => {
    if (!imageFile) return currentImageUrl

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
      alert('Image upload failed')
      return null
    }
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      let imageUrl = currentImageUrl
      if (imageFile) {
        const newUrl = await handleImageUpload()
        if (!newUrl) {
          setSaving(false)
          return
        }
        imageUrl = newUrl
      }

      const updateData = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        location: form.location,
        whatsapp: form.whatsapp,
        company_name: form.company_name || null,
        updated_at: new Date().toISOString(),
      }
      if (imageUrl) updateData.image_url = imageUrl

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)

      if (error) throw error

      alert('Product updated successfully')
      router.push(`/products/${productId}`)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading product...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product name *</label>
            <input name="name" required value={form.name} onChange={handleChange} className="w-full p-2 border rounded-xl" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" rows="3" value={form.description} onChange={handleChange} className="w-full p-2 border rounded-xl" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price (₹) *</label>
            <input name="price" type="number" required value={form.price} onChange={handleChange} className="w-full p-2 border rounded-xl" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select name="category" required value={form.category} onChange={handleChange} className="w-full p-2 border rounded-xl">
              <option value="">Select</option>
              <option value="Food">Food</option>
              <option value="Fitness">Fitness</option>
              <option value="Tech">Tech</option>
              <option value="Services">Services</option>
              <option value="Handloom">Handloom</option>
              <option value="Electronics">Electronics</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location *</label>
            <input name="location" required value={form.location} onChange={handleChange} className="w-full p-2 border rounded-xl" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp number *</label>
            <input name="whatsapp" required value={form.whatsapp} onChange={handleChange} className="w-full p-2 border rounded-xl" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Company name (optional)</label>
            <input name="company_name" value={form.company_name} onChange={handleChange} className="w-full p-2 border rounded-xl" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Product Image</label>
            {currentImageUrl && (
              <div className="mb-2">
                <img src={currentImageUrl} alt="Current" className="h-32 w-auto object-cover rounded" />
                <p className="text-xs text-gray-500 mt-1">Current image</p>
              </div>
            )}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-sm" />
            <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
          </div>

          <button type="submit" disabled={saving} className="w-full bg-green-600 text-white py-2 rounded-full">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </main>
  )
}