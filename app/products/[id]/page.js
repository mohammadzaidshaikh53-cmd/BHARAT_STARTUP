'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Helper functions (unchanged)
const formatWhatsAppLink = (number) => {
  if (!number) return '#'
  let cleaned = String(number).replace(/\D/g, '')
  if (cleaned.length < 10) return '#'
  if (!cleaned.startsWith('91')) cleaned = `91${cleaned}`
  if (cleaned.length < 12 || cleaned.length > 15) return '#'
  return `https://wa.me/${cleaned}`
}

const getRelativeTime = (timestamp) => {
  if (!timestamp) return null
  try {
    const date = new Date(timestamp)
    const now = new Date()
    if (isNaN(date.getTime())) return null
    const diffMs = now - date
    if (diffMs < 0) return 'just now'
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffSecs < 60) return 'just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-IN')
  } catch { return null }
}

const formatPrice = (price) => {
  if (!price) return '0'
  const cleaned = String(price).replace(/[^\d.]/g, '')
  const parsed = parseFloat(cleaned) || 0
  return Number(parsed).toLocaleString('en-IN')
}

const hasPermission = (currentUser, product) => {
  if (!currentUser) return false
  return product.seller_id === currentUser.id
}

const getMatchLabel = (score) => {
  if (score >= 25) return { text: 'Great Fit', emoji: '🔥', color: 'bg-green-100 text-green-800' }
  if (score >= 15) return { text: 'Good Match', emoji: '👍', color: 'bg-yellow-100 text-yellow-800' }
  return { text: 'Weak Match', emoji: '⚠️', color: 'bg-gray-100 text-gray-600' }
}

const ImageWithFallback = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false)
  return (
    <>
      {!hasError && src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-auto object-contain"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 min-h-[300px] md:min-h-[450px]">
          <span className="text-gray-500 text-lg font-medium">📷 No image available</span>
        </div>
      )}
    </>
  )
}

const BackButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="mb-6 flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition"
  >
    ← Back
  </button>
)

const SimpleToast = ({ message, type = 'success' }) => {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(timer)
  }, [])
  if (!visible) return null
  const bgColor = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500' }[type] || 'bg-gray-500'
  return (
    <div className={`${bgColor} text-white px-6 py-3 rounded-full shadow-lg fixed bottom-6 right-6 z-50`}>
      {message}
    </div>
  )
}

const SkeletonRequest = () => (
  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
    <div className="flex gap-2 mb-3">
      <div className="h-6 bg-gray-200 rounded w-20"></div>
      <div className="h-6 bg-gray-200 rounded w-24"></div>
    </div>
    <div className="h-10 bg-gray-200 rounded-full w-32"></div>
  </div>
)

export default function ProductDetailPage({ params }) {
  const unwrappedParams = React.use(params)
  const id = unwrappedParams.id

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [matchingRequests, setMatchingRequests] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [showOnlyHighQuality, setShowOnlyHighQuality] = useState(false)
  const router = useRouter()

  const memoizedId = useMemo(() => id, [id])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data: { user: currentUser } } = await supabase.auth.getUser()
        setUser(currentUser || null)

        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', memoizedId)
          .maybeSingle()

        if (productError) throw productError
        if (!productData) {
          setError('Product not found.')
          setLoading(false)
          return
        }

        setProduct(productData)

        setRequestsLoading(true)
        const { data: matchedRequests, error: rpcError } = await supabase.rpc(
          'get_matches_for_product',
          { prod_id: memoizedId }
        )

        if (rpcError) {
          console.error('RPC error:', rpcError)
          setMatchingRequests([])
        } else {
          const sorted = (matchedRequests || []).sort((a, b) => b.match_score - a.match_score)
          setMatchingRequests(sorted)
        }
      } catch (err) {
        console.error(err)
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
        setRequestsLoading(false)
      }
    }

    if (memoizedId) fetchData()
  }, [memoizedId])

  const handleDelete = async () => {
    if (!confirm('Are you sure? This cannot be undone.')) return
    setDeleting(true)
    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', memoizedId)
      if (deleteError) throw deleteError
      setToastMessage({ type: 'success', message: '✅ Product deleted' })
      setTimeout(() => router.replace('/'), 1500)
    } catch (err) {
      setToastMessage({ type: 'error', message: `❌ ${err.message}` })
      setDeleting(false)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setToastMessage({ type: 'success', message: '✅ Copied!' })
    } catch {
      setToastMessage({ type: 'error', message: '❌ Failed to copy' })
    }
  }

  const handleBack = () => router.push('/')

  const displayedRequests = showOnlyHighQuality
    ? matchingRequests.filter(req => req.match_score >= 15)
    : matchingRequests

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-6 animate-pulse">
          <div className="w-full h-96 bg-gray-200 rounded-xl mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <BackButton onClick={handleBack} />
          <div className="text-center bg-white rounded-2xl shadow-sm p-8">
            <p className="text-red-600 text-lg font-semibold mb-4">⚠️ {error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-orange-600 text-white rounded-full">Retry</button>
          </div>
        </div>
      </main>
    )
  }

  if (!product) return null

  const isOwner = user && hasPermission(user, product)
  const whatsappLink = formatWhatsAppLink(product.whatsapp)
  const isValidWhatsApp = whatsappLink !== '#'

  return (
    <main className={`min-h-screen bg-gray-50 py-8 md:py-12 px-4 ${deleting ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="max-w-4xl mx-auto">
        <BackButton onClick={handleBack} />

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="w-full bg-gray-100 flex items-center justify-center min-h-[300px] md:min-h-[450px]">
            <ImageWithFallback src={product.image_url} alt={product.name} />
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{product.name}</h1>
              {/* ✅ Updated: use verification_status */}
              {product.verification_status === 'verified' && (
                <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">✅ Verified</span>
              )}
            </div>

            <div className="text-3xl md:text-4xl font-bold text-orange-600">₹{formatPrice(product.price)}</div>

            <div className="flex flex-wrap gap-3 text-sm">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">📦 {product.category}</span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">📍 {product.location}</span>
              {product.created_at && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">🕒 {getRelativeTime(product.created_at)}</span>}
            </div>

            {product.company_name && <p className="text-gray-800 font-semibold">🏢 {product.company_name}</p>}

            <div className="pt-2 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{product.description || 'No description provided'}</p>
            </div>

            <div className="pt-4 space-y-3">
              {isValidWhatsApp ? (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full block text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-full transition">
                  📱 Contact Supplier on WhatsApp
                </a>
              ) : (
                <button disabled className="w-full bg-gray-300 text-gray-600 font-semibold py-3 px-6 rounded-full cursor-not-allowed">📱 WhatsApp Not Available</button>
              )}

              {product.whatsapp && (
                <button onClick={() => copyToClipboard(product.whatsapp)} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-full transition">
                  📋 Copy Phone Number
                </button>
              )}

              {isOwner && (
                <>
                  <button onClick={() => router.push(`/products/${memoizedId}/edit`)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full transition">
                    ✏️ Edit Product
                  </button>
                  <button onClick={handleDelete} disabled={deleting} className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-full transition">
                    {deleting ? '⏳ Deleting...' : '🗑️ Delete Product'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Matching Requests Section */}
        <div className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🔥 Matching Buyer Requests</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={showOnlyHighQuality}
                  onChange={(e) => setShowOnlyHighQuality(e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                Show only high-quality matches (score ≥ 15)
              </label>
            </div>
          </div>

          {requestsLoading && matchingRequests.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <SkeletonRequest key={i} />)}
            </div>
          )}

          {!requestsLoading && displayedRequests.length === 0 && matchingRequests.length === 0 && (
            <div className="bg-blue-50 rounded-xl p-8 text-center border border-blue-200">
              <p className="text-blue-900 font-medium">ℹ️ No matching buyer requests found yet.</p>
              <p className="text-blue-700 text-sm mt-2">Try updating your product category or description to attract more buyers.</p>
            </div>
          )}

          {!requestsLoading && displayedRequests.length === 0 && matchingRequests.length > 0 && showOnlyHighQuality && (
            <div className="bg-yellow-50 rounded-xl p-6 text-center border border-yellow-200">
              <p className="text-yellow-800">No high-quality matches (score ≥ 15).</p>
              <button onClick={() => setShowOnlyHighQuality(false)} className="text-orange-600 underline mt-2">
                Show all matches instead
              </button>
            </div>
          )}

          {displayedRequests.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedRequests.map((req) => {
                const { text, emoji, color } = getMatchLabel(req.match_score)
                const reqWhatsapp = formatWhatsAppLink(req.whatsapp)
                return (
                  <div key={req.request_id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-lg transition">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg text-gray-900">{req.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${color}`}>
                        {emoji} {text} ({req.match_score}/30)
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{req.description || 'No description'}</p>
                    <div className="flex flex-wrap gap-2 mt-3 text-xs">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{req.category}</span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">📍 {req.location}</span>
                    </div>
                    <div className="mt-3 font-bold text-orange-600">Budget: ₹{formatPrice(req.budget)}</div>
                    {req.created_at && <p className="text-gray-500 text-xs mt-2">Posted {getRelativeTime(req.created_at)}</p>}
                    <div className="mt-4">
                      {reqWhatsapp !== '#' ? (
                        <a href={reqWhatsapp} target="_blank" rel="noopener noreferrer" className="inline-block text-sm bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-full transition">
                          💬 Contact Buyer
                        </a>
                      ) : (
                        <button disabled className="inline-block text-sm bg-gray-300 text-gray-600 py-2 px-4 rounded-full cursor-not-allowed">
                          No Contact Info
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {toastMessage && <SimpleToast message={toastMessage.message} type={toastMessage.type} />}
    </main>
  )
}