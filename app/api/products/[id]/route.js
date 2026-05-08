// app/api/products/[id]/route.js — Server-side product update/delete
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, category, location, whatsapp, company_name, seller_id, image_url } = body;

    if (!seller_id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify ownership
    const { data: existing } = await supabase.from('products').select('seller_id').eq('id', id).single();
    if (!existing || existing.seller_id !== seller_id) {
      return NextResponse.json({ error: 'Not authorized to edit this product' }, { status: 403 });
    }

    const updates = {};
    if (name) updates.name = String(name).trim().slice(0, 200);
    if (description !== undefined) updates.description = description ? String(description).trim().slice(0, 2000) : null;
    if (price !== undefined) updates.price = Math.max(0, Number(price));
    if (category) updates.category = String(category).trim();
    if (location !== undefined) updates.location = location ? String(location).trim() : null;
    if (whatsapp !== undefined) updates.whatsapp = whatsapp ? String(whatsapp).replace(/[^0-9+]/g, '').slice(0, 15) : null;
    if (company_name !== undefined) updates.company_name = company_name ? String(company_name).trim().slice(0, 100) : null;
    if (image_url !== undefined) updates.image_url = image_url;

    const { error } = await supabase.from('products').update(updates).eq('id', id).eq('seller_id', seller_id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API /products/[id] PUT]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('seller_id');

    if (!sellerId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Soft delete: set verified = false and mark as inactive
    // This preserves data for undo operations
    const { error } = await supabase
      .from('products')
      .update({ verified: false, verification_status: 'rejected', rejection_reason: 'Deleted by owner' })
      .eq('id', id)
      .eq('seller_id', sellerId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API /products/[id] DELETE]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
