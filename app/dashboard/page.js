'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const categories = ['all', 'Food', 'Fitness', 'Tech', 'Services', 'Handloom', 'Electronics']

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [myProducts, setMyProducts] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [matchesLoading, setMatchesLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [toast, setToast] = useState(null)

  // Filter/Sort states for products
  const [productFilter, setProductFilter] = useState('all')
  const [productSort, setProductSort] = useState('newest')

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        if (userError || !currentUser) {
          router.push('/login')
          return
        }
        setUser(currentUser)

        // Check if admin
        const { data: adminData } = await supabase
          .from('admins')
          .select('user_id')
          .eq('user_id', currentUser.id)
          .maybeSingle()
        setIsAdmin(!!adminData)

        // Fetch user's products
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', currentUser.id)
          .order('created_at', { ascending: false })
        if (productsError) throw productsError
        setMyProducts(products || [])

        // Fetch user's requests
        const { data: requests, error: requestsError } = await supabase
          .from('requests')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
        if (requestsError) throw requestsError
        setMyRequests(requests || [])

        // Fetch matches (as seller or requester)
        const { data: matchesData, error: matchesError } = await supabase
          .from('product_request_matches')
          .select('*')
          .or(`seller_id.eq.${currentUser.id},requester_id.eq.${currentUser.id}`)
          .order('match_score', { ascending: false })
          .limit(10)

        if (matchesError) {
          console.error('Matches fetch error:', matchesError)
        } else {
          setMatches(matchesData || [])
        }
        setMatchesLoading(false)
      } catch (err) {
        console.error(err)
        alert('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndData()
  }, [router])

  // Profile strength calculation
  const profileStrength = (() => {
    let score = 0
    if (user?.email) score += 20
    if (myProducts.length > 0) score += 30
    if (myRequests.length > 0) score += 20
    if (myProducts.some(p => p.image_url)) score += 20
    if (myProducts.some(p => p.whatsapp) || myRequests.some(r => r.whatsapp)) score += 10
    return Math.min(score, 100)
  })()

  // Filtered & sorted products
  const filteredProducts = myProducts
    .filter(p => productFilter === 'all' || p.category === productFilter)
    .sort((a, b) => {
      if (productSort === 'newest') return new Date(b.created_at) - new Date(a.created_at)
      if (productSort === 'price_asc') return (a.price || 0) - (b.price || 0)
      return 0
    })

  // Delete handlers
  const handleDeleteProduct = async (productId) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    const deletedProduct = myProducts.find(p => p.id === productId)
    setMyProducts(prev => prev.filter(p => p.id !== productId))
    setDeletingId(productId)
    setToast({ type: 'product', id: productId, data: deletedProduct, message: 'Product deleted' })
    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) {
      setMyProducts(prev => [deletedProduct, ...prev])
      setToast({ type: 'error', message: 'Delete failed: ' + error.message })
      setTimeout(() => setToast(null), 3000)
    } else {
      setTimeout(() => setToast(null), 5000)
    }
    setDeletingId(null)
  }

  const handleDeleteRequest = async (requestId) => {
    if (!confirm('Delete this request? This cannot be undone.')) return
    const deletedRequest = myRequests.find(r => r.id === requestId)
    setMyRequests(prev => prev.filter(r => r.id !== requestId))
    setDeletingId(requestId)
    setToast({ type: 'request', id: requestId, data: deletedRequest, message: 'Request deleted' })
    const { error } = await supabase.from('requests').delete().eq('id', requestId)
    if (error) {
      setMyRequests(prev => [deletedRequest, ...prev])
      setToast({ type: 'error', message: 'Delete failed: ' + error.message })
      setTimeout(() => setToast(null), 3000)
    } else {
      setTimeout(() => setToast(null), 5000)
    }
    setDeletingId(null)
  }

  const undoDelete = () => {
    if (!toast || toast.type === 'error') return
    if (toast.type === 'product') {
      setMyProducts(prev => [toast.data, ...prev])
    } else if (toast.type === 'request') {
      setMyRequests(prev => [toast.data, ...prev])
    }
    setToast(null)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading dashboard...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.email}</p>
          </div>
          {isAdmin && (
            <a href="/admin/verify" className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm transition">
              🔒 Admin Panel
            </a>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-500">
            <p className="text-gray-500 text-sm">Total Products</p>
            <p className="text-2xl font-bold">{myProducts.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Total Requests</p>
            <p className="text-2xl font-bold">{myRequests.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Matches Found</p>
            <p className="text-2xl font-bold">{matches.length}</p>
          </div>
        </div>

        {/* Profile Strength */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8 flex flex-wrap justify-between items-center">
          <div>
            <p className="font-medium">Profile Strength</p>
            <p className="text-sm text-gray-500">Complete more to get better matches</p>
          </div>
          <div className="w-48">
            <div className="bg-gray-200 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${profileStrength}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{profileStrength}% complete</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <a href="/add-product" className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium transition">+ Add Product</a>
          <a href="/add-request" className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-full text-sm font-medium transition">+ Post Request</a>
          {matches.length > 0 && (
            <button onClick={() => document.getElementById('matches-section')?.scrollIntoView({ behavior: 'smooth' })} className="px-5 py-2 border border-orange-600 text-orange-600 hover:bg-orange-50 rounded-full text-sm font-medium transition">
              🔥 View Matches ({matches.length})
            </button>
          )}
        </div>

        {/* Matches For You Section */}
        <section id="matches-section" className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">🔥 Matches For You</h2>
          {matchesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-xl shadow-sm p-5 border animate-pulse h-32"></div>)}
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
              <p className="text-gray-600">No matches yet. Add more details to your products or requests.</p>
              <p className="text-gray-400 text-sm mt-2">Matches appear when a buyer request aligns with your product (or vice versa).</p>
              <div className="flex gap-3 justify-center mt-4">
                <a href="/add-product" className="text-sm bg-green-600 text-white px-3 py-1 rounded-full">Add Product</a>
                <a href="/add-request" className="text-sm bg-gray-800 text-white px-3 py-1 rounded-full">Post Request</a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((match) => (
                <div key={`${match.product_id}-${match.request_id}`} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {match.product_name} ↔ {match.request_title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Match score: {match.match_score}/30</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      match.match_score >= 25 ? 'bg-green-100 text-green-800' : 
                      match.match_score >= 15 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {match.match_score >= 25 ? '🔥 Great' : match.match_score >= 15 ? '👍 Good' : '⚠️ Weak'}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <a href={`/products/${match.product_id}`} className="text-sm bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-full transition">
                      View Product
                    </a>
                    <a href={`/requests/${match.request_id}`} className="text-sm bg-gray-800 hover:bg-gray-900 text-white px-3 py-1.5 rounded-full transition">
                      View Request
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* My Products Section */}
        <section className="mb-12">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-2xl font-semibold">📦 My Products</h2>
            <div className="flex flex-wrap gap-2">
              <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="border border-gray-300 rounded-full px-3 py-1 text-sm bg-white">
                <option value="all">All Categories</option>
                {categories.filter(c => c !== 'all').map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <select value={productSort} onChange={(e) => setProductSort(e.target.value)} className="border border-gray-300 rounded-full px-3 py-1 text-sm bg-white">
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
              </select>
            </div>
          </div>

          {myProducts.length === 0 ? (
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-10 text-center border-2 border-dashed border-gray-300">
              <p className="text-gray-600 mb-2">🚀 Start selling today</p>
              <p className="text-gray-400 text-sm mb-4">Add your first product and get discovered by buyers</p>
              <a href="/add-product" className="bg-green-600 text-white px-6 py-2 rounded-full inline-block">+ Add Product</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const isNew = new Date(product.created_at) > new Date(Date.now() - 7*24*60*60*1000)
                const isLowPrice = product.price < 500
                return (
                  <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                    {product.image_url && (
                      <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover" />
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                        {/* ✅ UPDATED: use verification_status instead of verified */}
                        {product.verification_status === 'verified' && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">✓</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {isNew && <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">New</span>}
                        {isLowPrice && <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Low price</span>}
                      </div>
                      <p className="text-orange-600 font-bold mt-1">₹{Number(product.price).toLocaleString('en-IN')}</p>
                      <p className="text-gray-500 text-sm mt-1">{product.category} • {product.location}</p>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => router.push(`/products/${product.id}/edit`)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-full text-sm transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={deletingId === product.id}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1.5 rounded-full text-sm disabled:opacity-50 transition"
                        >
                          {deletingId === product.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* My Requests Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">📢 My Requests</h2>
          {myRequests.length === 0 ? (
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-10 text-center border-2 border-dashed border-gray-300">
              <p className="text-gray-600 mb-2">🎯 Looking for something?</p>
              <p className="text-gray-400 text-sm mb-4">Post a request and let suppliers find YOU</p>
              <a href="/add-request" className="bg-gray-800 text-white px-6 py-2 rounded-full inline-block">+ Post Request</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
                  <h3 className="font-semibold text-lg">{req.title}</h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{req.description || 'No description'}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="bg-gray-100 px-2 py-1 rounded-full">{req.category}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-full">{req.location}</span>
                  </div>
                  <p className="text-gray-800 font-bold mt-2">Budget: ₹{Number(req.budget).toLocaleString('en-IN')}</p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => router.push(`/requests/${req.id}/edit`)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-full text-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(req.id)}
                      disabled={deletingId === req.id}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1.5 rounded-full text-sm disabled:opacity-50 transition"
                    >
                      {deletingId === req.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Toast Notification with Undo */}
        {toast && (
          <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-4 z-50 animate-in slide-in-from-right">
            <span>{toast.message}</span>
            {toast.type !== 'error' && (
              <button onClick={undoDelete} className="text-orange-400 underline text-sm font-medium">Undo</button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}