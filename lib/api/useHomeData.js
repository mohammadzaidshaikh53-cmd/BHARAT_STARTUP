// lib/api/useHomeData.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useHomeData() {
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ products: 0, buyers: 0, categories: 0, verified: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [{ data: productsData }, { data: requestsData }] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('requests').select('*').order('created_at', { ascending: false }),
      ]);

      const prods = productsData || [];
      const reqs = requestsData || [];

      const cats = new Set(prods.map(p => p.category).filter(Boolean));
      const verified = prods.filter(p => p.verification_status === 'verified').length;

      setProducts(prods);
      setRequests(reqs);
      setStats({
        products: prods.length,
        buyers: reqs.length,
        categories: cats.size,
        verified,
      });
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { products, requests, stats, isLoading, error, refetch: fetchData };
}