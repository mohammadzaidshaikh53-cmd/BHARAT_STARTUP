# Bharat Startup Marketplace 🇮🇳

**India’s friction-free B2B discovery platform for startups** — connect verified startups with real buyers directly on WhatsApp. No middlemen, no platform lock-in, no payment gateways. Just trade.

---

## 📌 The Problem

Indian startups struggle to get discovered. Buyers don't trust random online listings. Existing marketplaces charge high commissions, force payment gateways, and disrupt the natural conversation-based buying process.

**Result?** Good products never reach the right buyers.

---

## 💡 The Solution

Bharat Startup reverses the model. We don't get between buyers and sellers. We **match** them and let WhatsApp handle the rest.

* **For startups** → list products, add images, set price, share location
* **For buyers** → browse, filter, contact the seller directly
* **For everyone** → zero transaction fees, instant WhatsApp communication

It’s a **discovery engine**, not a checkout system.

---

## ✨ Key Features

| Feature              | Description                                     |
| -------------------- | ----------------------------------------------- |
| Product listings     | Startups add products with full details + image |
| Buyer requests       | Buyers post requirements with budget & category |
| Smart matching       | Bidirectional category-based matching           |
| Product detail page  | Full view + matching buyer requests             |
| Authentication       | Email/password login via Supabase               |
| Ownership            | Each product linked to `seller_id`              |
| WhatsApp integration | Direct contact, no platform friction            |

---

## 🔄 How It Works

### Sellers (Startups)

1. Sign up / login
2. Add product
3. Upload image
4. Get contacted via WhatsApp

### Buyers

1. Browse or search
2. View product
3. Click contact → WhatsApp
4. Or post requirement

---

## 🧱 Tech Architecture

| Layer      | Tech                                 |
| ---------- | ------------------------------------ |
| Frontend   | Next.js (App Router) + Tailwind      |
| Backend    | Supabase (PostgreSQL, Auth, Storage) |
| Auth       | Supabase Auth                        |
| Storage    | Supabase Storage                     |
| Deployment | Vercel                               |

---

## 🔐 Security

* Row Level Security (RLS) enabled
* Only owners can modify their products
* `seller_id` enforces ownership
* Public read, restricted write

---

## 📱 UX Highlights

* Responsive grid UI
* Category filters + search
* Hot buyer requests
* Product detail page
* Mobile-first experience

---

## 📈 Scalability

* Current: client-side filtering
* Future:

  * server-side filtering
  * pagination
  * indexing
  * caching

---

## 🧭 Roadmap

* Edit / Delete products
* Admin verification
* Multi-image support
* Advanced filters
* Better matching

---

## 🚀 Getting Started

### 1. Install

```bash
npm install
npm run dev
```

---

### 2. Environment Variables

Create `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

### 3. Supabase Setup

* Create `products` and `requests` tables
* Enable RLS
* Create storage bucket: `product-images`

---

## 🌍 Goal

Help Indian startups connect with real buyers — instantly, directly, and without friction.