'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const formatWhatsAppLink = (number) => {
  if (!number) return '#'
  let cleaned = String(number).replace(/\D/g, '')
  if (!cleaned.startsWith('91')) cleaned = `91${cleaned}`
  return `https://wa.me/${cleaned}`
}

const getRelativeTime = (timestamp) => {
  if (!timestamp) return null
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

const getLocationColor = (location) => {
  if (!location) return 'bg-gray-100 text-gray-800'
  const colors = {
    mumbai: 'bg-purple-100 text-purple-800',
    delhi: 'bg-blue-100 text-blue-800',
    bangalore: 'bg-green-100 text-green-800',
    pune: 'bg-indigo-100 text-indigo-800',
    chennai: 'bg-yellow-100 text-yellow-800',
    kolkata: 'bg-pink-100 text-pink-800',
  }
  const key = location.toLowerCase()
  return colors[key] || 'bg-gray-100 text-gray-800'
}

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [requests, setRequests] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const categories = ['all', 'Food', 'Fitness', 'Tech', 'Services', 'Handloom', 'Electronics']

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
        if (productsError) throw productsError

        const { data: requestsData, error: requestsError } = await supabase
          .from('requests')
          .select('*')
          .order('created_at', { ascending: false })
        if (requestsError) throw requestsError

        setProducts(productsData || [])
        setRequests(requestsData || [])
        setFilteredProducts(productsData || [])
      } catch (err) {
        setError(err.message)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    let filtered = [...products]
    if (activeCategory !== 'all') {
      filtered = filtered.filter(p =>
        (p.category || "").toLowerCase().trim() === activeCategory.toLowerCase().trim()
      )
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(p =>
        (p.name || "").toLowerCase().includes(term) ||
        (p.category || "").toLowerCase().includes(term) ||
        (p.location || "").toLowerCase().includes(term) ||
        (p.company_name || "").toLowerCase().includes(term)
      )
    }
    setFilteredProducts(filtered)
  }, [searchTerm, activeCategory, products])

  const hotRequests = [...requests].sort((a, b) => {
    if (!a.created_at) return 1
    if (!b.created_at) return -1
    return new Date(b.created_at) - new Date(a.created_at)
  }).slice(0, 3)

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading marketplace...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p>Failed to load data: {error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-orange-600 underline">
            Retry
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Bharat Startup
                </span>
                <span className="text-xl">🇮🇳</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Connect Indian startups with real buyers
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/add-product"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium transition shadow-sm"
              >
                + Add Product
              </a>
              <a
                href="/add-request"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-full text-sm font-medium transition shadow-sm"
              >
                + Post Requirement
              </a>
            </div>
          </div>

          <div className="mt-4">
            <input
              type="text"
              placeholder="🔍 Search products (name, category, location, brand)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  activeCategory === cat
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hotRequests.length > 0 && (
          <section className="mb-12 bg-orange-50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
              🔥 Hot Buyer Requests (Latest)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hotRequests.map((req, idx) => {
                const matchingCount = products.filter(p =>
                  (p.category || "").toLowerCase().includes((req.category || "").toLowerCase()) ||
                  (req.category || "").toLowerCase().includes((p.category || "").toLowerCase())
                ).length
                return (
                  <div key={req.id || `hot-${idx}`} className="bg-white rounded-xl shadow-sm p-4">
                    <h3 className="font-semibold">{req.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                      <span className="bg-gray-100 px-2 py-1 rounded-full">{req.category}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded-full">{req.location}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-lg font-bold text-orange-600">
                        ₹{Number(req.budget || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    {req.created_at && (
                      <div className="mt-1 text-xs text-gray-500">⏱ {getRelativeTime(req.created_at)}</div>
                    )}
                    <div className="mt-2 text-xs text-blue-600">
                      💡 {matchingCount} matching suppliers available
                    </div>
                    <a
                      href={formatWhatsAppLink(req.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block w-full text-center bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium py-2 px-3 rounded-full"
                    >
                      Sell to Buyer
                    </a>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <section className="mb-20">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🔥 Products from Startups</h2>
            <span className="text-sm text-gray-500">{filteredProducts.length} listings</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-gray-500 mb-3">No products match your filters.</p>
              <a href="/add-product" className="text-orange-600 underline font-medium">
                Be the first startup to showcase your product 🚀
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, idx) => {
                const matchingRequests = requests.filter(req =>
                  (req.category || "").toLowerCase().includes((product.category || "").toLowerCase()) ||
                  (product.category || "").toLowerCase().includes((req.category || "").toLowerCase())
                ).length
                return (
                  <div
                    key={product.id || `prod-${idx}`}
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg transition duration-200 overflow-hidden flex flex-col"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                        📷 No image
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex items-start justify-between">
                        <a href={`/products/${product.id}`} className="block hover:underline">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {product.name}
                          </h3>
                        </a>
                        {product.verified && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                            ✅ Verified
                          </span>
                        )}
                      </div>
                      {product.company_name && (
                        <p className="text-xs text-gray-500 mt-1">🏢 {product.company_name}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3 text-xs">
                        <span className="bg-gray-100 px-2 py-1 rounded-full">{product.category}</span>
                        <span className={`px-2 py-1 rounded-full ${getLocationColor(product.location)}`}>
                          📍 {product.location}
                        </span>
                      </div>
                      <div className="mt-4">
                        <span className="text-2xl font-bold text-orange-600">
                          ₹{Number(product.price || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      {product.created_at && (
                        <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                          <span>🆕</span> {getRelativeTime(product.created_at)}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-blue-600">
                        🔥 {matchingRequests} buyers looking for this
                      </div>
                      <a
                        href={formatWhatsAppLink(product.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-full transition w-full"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.588 2.014.896 3.149.896h.002c3.18 0 5.767-2.586 5.768-5.766.001-3.18-2.585-5.767-5.766-5.768zm2.421 8.169c-.167.476-.987.913-1.385.964-.42.054-.784.082-1.225-.085-.45-.17-.902-.434-1.316-.848-.414-.415-.678-.866-.849-1.316-.167-.441-.139-.805-.085-1.225.051-.398.488-1.218.964-1.385.089-.031.178-.031.251.034.34.263.692.767.915 1.176.078.146.053.289-.015.415-.089.169-.207.352-.316.507-.111.159-.191.276-.293.399-.102.123-.21.233-.078.361.348.348.864.695 1.226.902.129.078.273.045.373-.039.139-.118.278-.256.396-.398.118-.143.226-.219.375-.139.409.209.913.54 1.176.915.065.083.065.166.034.251z" />
                        </svg>
                        Contact Supplier
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <div className="border-t border-gray-200 my-10"></div>

        <section className="mb-20">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">📢 All Buyer Requests</h2>
            <span className="text-sm text-gray-500">{requests.length} requests</span>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-gray-500 mb-3">No buyer requests yet.</p>
              <a href="/add-request" className="text-orange-600 underline font-medium">
                Post your requirement now 🚀
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {requests.map((req, idx) => {
                const matchingProducts = products.filter(p =>
                  (p.category || "").toLowerCase().includes((req.category || "").toLowerCase()) ||
                  (req.category || "").toLowerCase().includes((p.category || "").toLowerCase())
                ).length
                return (
                  <div
                    key={req.id || `req-${idx}`}
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg transition duration-200 overflow-hidden flex flex-col"
                  >
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {req.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2 text-xs">
                        <span className="bg-gray-100 px-2 py-1 rounded-full">{req.category}</span>
                        <span className={`px-2 py-1 rounded-full ${getLocationColor(req.location)}`}>
                          📍 {req.location}
                        </span>
                      </div>
                      <div className="mt-4">
                        <span className="text-2xl font-bold text-gray-800">
                          ₹{Number(req.budget || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">budget</span>
                      </div>
                      {req.created_at && (
                        <div className="mt-2 text-xs text-gray-500">
                          ⏱ {getRelativeTime(req.created_at)}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-blue-600">
                        💡 {matchingProducts} matching suppliers available
                      </div>
                      <a
                        href={formatWhatsAppLink(req.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium py-2 px-4 rounded-full transition w-full"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Sell to Buyer
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 flex justify-center gap-4 shadow-lg z-20">
        <a
          href="/add-product"
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium transition"
        >
          + Add Product
        </a>
        <a
          href="/add-request"
          className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-full text-sm font-medium transition"
        >
          + Post Requirement
        </a>
      </div>
    </main>
  )
}