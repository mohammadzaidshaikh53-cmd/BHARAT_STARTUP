'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminVerifyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [userId, setUserId] = useState(null)
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState({ pending: 0, verifiedToday: 0, avgTime: null, rejectRate: null })
  const [updatingId, setUpdatingId] = useState(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [activeId, setActiveId] = useState(null)
  const [sortBy, setSortBy] = useState('priority')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(null)
  const [lastAction, setLastAction] = useState(null)
  const [processingId, setProcessingId] = useState(null)
  const PAGE_SIZE = 10
  const productRefs = useRef({})

  const fetchProducts = useCallback(async (reset = true, overridePage = null) => {
    if (!userId) return
    try {
      const currentPage = reset ? 0 : (overridePage ?? page)
      let query = supabase
        .from('pending_products')
        .select('*', { count: 'exact' })
        .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1)

      if (sortBy === 'priority') {
        query = query.order('priority_score', { ascending: false })
      } else if (sortBy === 'price_high') {
        query = query.order('price', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: true })
      }

      const { data, error, count } = await query
      if (error) throw error
      if (reset) setProducts(data || [])
      else setProducts(prev => [...prev, ...(data || [])])
      setHasMore((data?.length || 0) === PAGE_SIZE)
      setStats(prev => ({ ...prev, pending: count || 0 }))
    } catch (err) {
      console.error(err)
      alert('Failed to load products')
    }
  }, [userId, page, sortBy])

  const fetchMetrics = useCallback(async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from('admin_metrics')
      .select('*')
      .maybeSingle()
    if (!error && data) {
      setStats(prev => ({
        ...prev,
        avgTime: data.avg_minutes_7d ? data.avg_minutes_7d.toFixed(1) : null,
        rejectRate: data.rejection_rate ? data.rejection_rate.toFixed(1) : null
      }))
    }
  }, [userId])

  const refetchStats = useCallback(async () => {
    if (!userId) return
    const { count: pendingCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'pending')
    const today = new Date().toISOString().split('T')[0]
    const { count: verifiedTodayCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'verified')
      .gte('verified_at', today)
    setStats(prev => ({ ...prev, pending: pendingCount ?? 0, verifiedToday: verifiedTodayCount ?? 0 }))
  }, [userId])

  const acquireLock = async (productId) => {
    const { data, error } = await supabase.rpc('acquire_product_lock', {
      p_id: productId,
      u_id: userId
    })
    if (error) {
      console.error('Lock error:', error)
      return false
    }
    return data === true
  }

  const releaseLock = async (productId) => {
    await supabase
      .from('products')
      .update({ processing_by: null, processing_at: null })
      .eq('id', productId)
      .eq('processing_by', userId)
  }

  const verifyProduct = async (productId, statusVerified, reason = null) => {
    const productToUndo = products.find(p => p.id === productId)
    if (!productToUndo) return
    setUpdatingId(productId)
    setProcessingId(productId)

    const locked = await acquireLock(productId)
    if (!locked) {
      alert('Another admin is processing this product (or lock expired).')
      setUpdatingId(null); setProcessingId(null)
      return
    }

    try {
      const newStatus = statusVerified ? 'verified' : 'rejected'
      const updateObj = {
        verification_status: newStatus,
        verified_by: userId,
        verified_at: new Date().toISOString(),
        processing_by: null,
        processing_at: null
      }
      if (!statusVerified && reason) updateObj.rejection_reason = reason

      const { error } = await supabase
        .from('products')
        .update(updateObj)
        .eq('id', productId)
        .eq('verification_status', 'pending')

      if (error) throw error

      setProducts(prev => prev.filter(p => p.id !== productId))
      await refetchStats()
      await fetchMetrics()

      setLastAction({
        id: productId,
        status: newStatus,
        product: productToUndo,
        timeout: setTimeout(() => setLastAction(null), 5000)
      })

      const remaining = products.filter(p => p.id !== productId)
      if (remaining.length > 0) {
        const nextId = remaining[0].id
        productRefs.current[nextId]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setActiveId(nextId)
      }
    } catch (err) {
      alert(`Failed to ${statusVerified ? 'verify' : 'reject'}: ` + err.message)
    } finally {
      setUpdatingId(null)
      setProcessingId(null)
      setShowRejectModal(null)
      setRejectReason('')
      await releaseLock(productId)
    }
  }

  const undoLastAction = async () => {
    if (!lastAction) return
    clearTimeout(lastAction.timeout)

    const { data: current, error: checkError } = await supabase
      .from('products')
      .select('verification_status, verified_by')
      .eq('id', lastAction.id)
      .single()

    if (checkError || !current) {
      alert('Cannot undo – product not found')
      setLastAction(null)
      return
    }
    if (current.verification_status !== lastAction.status) {
      alert('Cannot undo – status changed')
      setLastAction(null)
      return
    }
    if (current.verified_by !== userId) {
      alert('You can only undo your own actions')
      setLastAction(null)
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({
          verification_status: 'pending',
          verified_by: null,
          verified_at: null,
          rejection_reason: null
        })
        .eq('id', lastAction.id)
        .eq('verification_status', lastAction.status)
        .eq('verified_by', userId)

      if (error) throw error

      setProducts(prev => {
        const newList = [...prev, lastAction.product]
        if (sortBy === 'priority') return newList.sort((a,b) => b.priority_score - a.priority_score)
        if (sortBy === 'price_high') return newList.sort((a,b) => b.price - a.price)
        return newList.sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
      })
      await refetchStats()
      await fetchMetrics()
    } catch (err) {
      alert('Undo failed: ' + err.message)
    } finally {
      setLastAction(null)
    }
  }

  const bulkVerify = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    if (!confirm(`Verify ${ids.length} product(s)?`)) return
    setBulkLoading(true)
    try {
      const { error } = await supabase
        .from('products')
        .update({
          verification_status: 'verified',
          verified_by: userId,
          verified_at: new Date().toISOString()
        })
        .in('id', ids)
        .eq('verification_status', 'pending')
      if (error) throw error

      setProducts(prev => prev.filter(p => !ids.includes(p.id)))
      setSelectedIds(new Set())
      await refetchStats()
      await fetchMetrics()
    } catch (err) {
      alert('Bulk verify failed: ' + err.message)
    } finally {
      setBulkLoading(false)
    }
  }

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(products.map(p => p.id)))
  }

  const loadMore = async () => {
    const nextPage = page + 1
    setPage(nextPage)
    await fetchProducts(false, nextPage)
  }

  useEffect(() => {
    const interval = setInterval(() => { if (isAdmin) refetchStats() }, 30000)
    return () => clearInterval(interval)
  }, [isAdmin, refetchStats])

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) { router.push('/login'); return }
        setAdminEmail(user.email || '')
        setUserId(user.id)

        const { data: adminData } = await supabase
          .from('admins')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle()
        if (!adminData) { setIsAdmin(false); setLoading(false); return }
        setIsAdmin(true)

        await refetchStats()
        await fetchMetrics()
        await fetchProducts(true)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    init()
  }, [router, fetchProducts, refetchStats, fetchMetrics])

  useEffect(() => { if (userId) fetchProducts(true) }, [sortBy, userId, fetchProducts])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeId) return
      if (e.key === 'v') verifyProduct(activeId, true)
      else if (e.key === 'r') setShowRejectModal(activeId)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeId, verifyProduct])

  if (loading) return <div className="p-8 text-center">Loading admin panel...</div>
  if (!isAdmin) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <button onClick={() => router.push('/')} className="mt-4 text-orange-600 underline">Go Home</button>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Verification Panel</h1>
            <p className="text-gray-500 text-sm">
              Logged in as <strong>{adminEmail}</strong> — 
              <kbd className="ml-1 px-1 bg-gray-200 rounded">V</kbd> verify active, 
              <kbd className="ml-1 px-1 bg-gray-200 rounded">R</kbd> reject active
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white rounded-xl p-3 shadow-sm text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm text-center">
              <p className="text-2xl font-bold text-green-600">{stats.verifiedToday}</p>
              <p className="text-xs text-gray-500">Verified today</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm text-center">
              <p className="text-lg font-bold text-blue-600">{stats.avgTime ? `${stats.avgTime}m` : '-'}</p>
              <p className="text-xs text-gray-500">Avg time (7d)</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm text-center">
              <p className="text-lg font-bold text-purple-600">{stats.rejectRate ? `${stats.rejectRate}%` : '-'}</p>
              <p className="text-xs text-gray-500">Rejection rate</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded-full px-3 py-1 text-sm bg-white">
              <option value="priority">Priority (smart formula)</option>
              <option value="price_high">Highest price first</option>
              <option value="oldest">Oldest first</option>
            </select>
            {selectedIds.size > 0 && (
              <button onClick={bulkVerify} disabled={bulkLoading} className="bg-green-600 text-white px-4 py-1.5 rounded-full text-sm disabled:opacity-50">
                {bulkLoading ? 'Verifying...' : `Verify Selected (${selectedIds.size})`}
              </button>
            )}
            <button onClick={toggleSelectAll} className="text-sm text-gray-600 underline">
              {selectedIds.size === products.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          <button onClick={() => { fetchProducts(true); refetchStats(); fetchMetrics(); }} className="text-sm text-orange-600 underline">Refresh</button>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center border">
            <p className="text-gray-500">No pending products. Great job!</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {products.map(product => {
                const isStale = product.created_at && (new Date() - new Date(product.created_at)) > 7 * 24 * 60 * 60 * 1000
                return (
                  <div
                    key={product.id}
                    ref={el => productRefs.current[product.id] = el}
                    onMouseEnter={() => setActiveId(product.id)}
                    className={`bg-white rounded-xl shadow-sm border p-4 transition ${activeId === product.id ? 'ring-2 ring-orange-500' : ''} ${product.trust_score < 40 ? 'border-l-4 border-l-red-500' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleSelect(product.id)} className="mt-1" />
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-20 h-20 object-cover rounded" />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">No img</div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <p className="text-sm text-gray-500">{product.category} • {product.location}</p>
                            <p className="text-orange-600 font-bold mt-1">₹{Number(product.price).toLocaleString('en-IN')}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => verifyProduct(product.id, true)} disabled={updatingId === product.id || processingId === product.id} className="px-4 py-1.5 bg-green-600 text-white rounded-full text-sm disabled:opacity-50">
                              {updatingId === product.id ? '...' : '✓ Verify'}
                            </button>
                            <button onClick={() => setShowRejectModal(product.id)} disabled={updatingId === product.id || processingId === product.id} className="px-4 py-1.5 bg-red-500 text-white rounded-full text-sm disabled:opacity-50">
                              ✗ Reject
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{product.description || 'No description'}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-orange-600 h-1.5 rounded-full" style={{ width: `${product.trust_score}%` }}></div>
                          </div>
                          <span className="text-xs text-gray-500">Trust: {product.trust_score}/100</span>
                          {product.trust_score >= 70 && <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">🟢 High trust</span>}
                          {product.trust_score >= 40 && product.trust_score < 70 && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">🟡 Medium trust</span>}
                          {product.trust_score < 40 && <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">🔴 Low trust</span>}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs">
                          {product.price > 100000 && <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full">🚨 Very high price</span>}
                          {!product.description && <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full">⚠️ No description</span>}
                          {isStale && <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">⏳ Stale (&gt;7d)</span>}
                        </div>
                        <div className="mt-2 text-xs text-gray-400">ID: {product.id}</div>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs">
                          <span className={`px-2 py-1 rounded-full ${product.image_url ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.image_url ? '✓ Has image' : '✗ No image'}
                          </span>
                          <span className={`px-2 py-1 rounded-full ${product.description?.length > 20 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.description?.length > 20 ? '✓ Good description' : '✗ Short description'}
                          </span>
                          <span className={`px-2 py-1 rounded-full ${product.whatsapp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.whatsapp ? '✓ Contact' : '✗ No contact'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {hasMore && (
              <div className="text-center mt-6">
                <button onClick={loadMore} className="px-5 py-2 bg-gray-200 rounded-full text-sm">Load more</button>
              </div>
            )}
          </>
        )}

        {lastAction && (
          <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-4 z-50">
            <span>{lastAction.status === 'verified' ? '✅ Product verified' : '❌ Product rejected'}</span>
            <button onClick={undoLastAction} className="text-orange-400 underline text-sm font-medium">Undo</button>
          </div>
        )}

        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Reject Product</h3>
              <p className="text-sm text-gray-600 mb-3">Provide a reason (sent to seller & audit log):</p>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border rounded-lg p-2 mb-4"
                autoFocus
              >
                <option value="">Select reason</option>
                <option value="No image">No image</option>
                <option value="Spam">Spam</option>
                <option value="Wrong category">Wrong category</option>
                <option value="Incorrect price">Incorrect price</option>
                <option value="Duplicate">Duplicate listing</option>
                <option value="Other">Other</option>
              </select>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowRejectModal(null)} className="px-4 py-2 bg-gray-200 rounded-full">Cancel</button>
                <button
                  onClick={() => verifyProduct(showRejectModal, false, rejectReason || 'No reason')}
                  disabled={!rejectReason}
                  className="px-4 py-2 bg-red-600 text-white rounded-full disabled:opacity-50"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}