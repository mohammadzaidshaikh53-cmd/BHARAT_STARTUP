'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Enter email and password")
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else router.push('/')
    setLoading(false)
  }

  const handleSignUp = async () => {
    if (!email || !password) {
      alert("Enter email and password")
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else alert('Check your email to confirm!')
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Login / Sign Up</h1>
      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded-xl"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded-xl"
        />
        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-orange-600 text-white py-2 rounded-full"
        >
          Login
        </button>
        <button
          type="button"
          onClick={handleSignUp}
          disabled={loading}
          className="w-full bg-gray-800 text-white py-2 rounded-full"
        >
          Sign Up
        </button>
      </div>
    </div>
  )
}