// lib/marketplace/mockData.js
// Only used as an emergency fallback when Supabase is unreachable.
export const fallbackProducts = [
    {
        id: '1',
        name: 'Organic Bamboo Toothbrush Set',
        description: 'Eco-friendly, biodegradable handles with charcoal-infused bristles. Pack of 4.',
        price: 249,
        original_price: 399,
        discounted_price: 249,
        discount_percent: 37.6,
        savings: 150,
        image_url: '/images/product1.jpg',
        category: 'Handloom',
        location: 'Delhi',
        seller: { full_name: 'GreenWave', verified: true },
        verification_status: 'verified',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        whatsapp: '919876543210',
        product_stats: { views: 854, clicks: 312, inquiries: 45, saves: 22 },
        growth_velocity: 3.2,
        recency_multiplier: 1.0,
        interaction_rate: 0.08,
        deal_velocity: 2.1,
        deal_popularity: 4.5,
        seller_id: 'user_1',
        stock: 150,
        rating: 4.7,
        review_count: 128,
    },
    // ... additional products for offline development
];