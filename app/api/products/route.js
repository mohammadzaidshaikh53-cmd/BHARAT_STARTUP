// app/api/products/route.js — Server-side product mutations
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, price, category, location, whatsapp, company_name, seller_id, image_url } = body;

    if (!name || !price || !category || !seller_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Sanitize inputs
    const sanitized = {
      name: String(name).trim().slice(0, 200),
      description: description ? String(description).trim().slice(0, 2000) : null,
      price: Math.max(0, Number(price)),
      category: String(category).trim(),
      location: location ? String(location).trim() : null,
      whatsapp: whatsapp ? String(whatsapp).replace(/[^0-9+]/g, '').slice(0, 15) : null,
      company_name: company_name ? String(company_name).trim().slice(0, 100) : null,
      seller_id,
      verified: false,
      image_url: image_url || null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('products').insert([sanitized]).select('id').single();
    if (error) throw error;

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (err) {
    console.error('[API /products POST]', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
