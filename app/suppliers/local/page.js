'use client';

import { useState, useEffect } from 'react';
import { getLocalSuppliers } from '@/services/supplierService';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { MapPin, Shield, Star, MessageSquare } from 'lucide-react';

export default function LocalSourcingPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      // Try to get user's city from profile first
      const { data: { user } } = await supabase.auth.getUser();
      let city = '';
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('city')
          .eq('id', user.id)
          .single();
        if (profile?.city) {
          city = profile.city;
          setUserLocation(city);
          setSearchCity(city);
        }
      }
      
      if (city) {
        const data = await getLocalSuppliers(city);
        setSuppliers(data);
      }
      setLoading(false);
    }
    loadInitial();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchCity.trim()) return;
    setLoading(true);
    const data = await getLocalSuppliers(searchCity);
    setSuppliers(data);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-black mb-4 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-orange-400" />
            Local Sourcing
          </h1>
          <p className="text-indigo-100 text-lg max-w-2xl mb-8">
            Find and connect with verified suppliers in your city to reduce lead times and logistics costs.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Enter your city (e.g. Mumbai, Pune)..."
              className="flex-1 px-5 py-3 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-lg"
            />
            <button type="submit" className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95">
              Find Suppliers
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-white dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-700" />
            ))}
          </div>
        ) : suppliers.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">📍</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {searchCity ? `No suppliers found in "${searchCity}"` : "Set your location to see local suppliers"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Try searching for a different city or broaden your search terms.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <Link
                key={supplier.user_id}
                href={`/suppliers/${supplier.user_id}`}
                className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl">
                    {supplier.company_name?.charAt(0) || supplier.full_name?.charAt(0)}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                      <Shield className="w-3 h-3" />
                      {supplier.trustBadge || 'Verified'}
                    </span>
                    <span className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {supplier.location}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
                  {supplier.company_name || supplier.full_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                  {supplier.bio || 'Professional B2B supplier specializing in quality industrial and consumer goods.'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
                  <div className="flex items-center gap-1 text-orange-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold">{supplier.trustScore || '85'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Package className="w-4 h-4" />
                    {supplier.productCount} products
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Package(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
