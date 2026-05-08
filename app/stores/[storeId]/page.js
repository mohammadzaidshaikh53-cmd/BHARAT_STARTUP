'use client';

import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { Store, Star, MapPin, Phone, Mail, Globe, Shield, Award, Package } from 'lucide-react';
import { ScrollReveal, PhysicsCard } from '@/components/motion';
import { Button } from '@/components/ui/Button';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

// Mock store data
const MOCK_STORE = {
  id: 'techmart-india',
  name: 'TechMart India',
  description: 'Premium electronics and components supplier with 10+ years of experience. We specialize in industrial electronics, semiconductors, and custom PCBs.',
  logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400',
  cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200',
  owner: {
    name: 'Rajesh Kumar',
    email: 'rajesh@techmart.in',
    phone: '+91 98765 43210',
    verified: true,
    memberSince: '2022',
  },
  rating: 4.8,
  reviewCount: 234,
  products: 245,
  location: 'Mumbai, Maharashtra',
  website: 'https://techmart.in',
  verifiedBadges: ['Business Verified', 'Quality Assured', 'Fast Shipper'],
};

const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Industrial Arduino Mega 2560',
    price: 450,
    moq: 10,
    image: 'https://images.unsplash.com/photo-1558403194-6113082492b0?w=400',
    rating: 4.9,
    sales: 1250,
  },
  {
    id: '2',
    name: 'Raspberry Pi 4 Model B - 4GB',
    price: 2850,
    moq: 5,
    image: 'https://images.unsplash.com/photo-1558346490-a75e187d6f71?w=400',
    rating: 4.8,
    sales: 890,
  },
  {
    id: '3',
    name: 'ESP32 Development Board',
    price: 320,
    moq: 20,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    rating: 4.7,
    sales: 2100,
  },
  {
    id: '4',
    name: 'OLED Display Module 1.3"',
    price: 180,
    moq: 25,
    image: 'https://images.unsplash.com/photo-1601134467661-3d775b999c18?w=400',
    rating: 4.6,
    sales: 560,
  },
];

export default function StoreDetailPage() {
  const params = useParams();

  return (
    <div>
      {/* Cover & Header */}
      <div className="relative h-64 md:h-80">
        <img
          src={MOCK_STORE.cover}
          alt={MOCK_STORE.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 container-app">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springTransition}
            className="flex flex-col md:flex-row md:items-end gap-4 pb-6"
          >
            <img
              src={MOCK_STORE.logo}
              alt={MOCK_STORE.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white dark:border-gray-900 shadow-xl"
            />
            <div className="flex-1 text-white">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{MOCK_STORE.name}</h1>
                {MOCK_STORE.owner.verified && (
                  <span className="px-2 py-1 bg-emerald-500 rounded-full text-xs font-medium flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
              <p className="mt-2 text-white/80 max-w-2xl">{MOCK_STORE.description}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                <Mail className="w-4 h-4 mr-2" />
                Contact
              </Button>
              <Button>Visit Products</Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-app py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats */}
            <ScrollReveal>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Rating', value: MOCK_STORE.rating, icon: Star },
                  { label: 'Reviews', value: MOCK_STORE.reviewCount, icon: Award },
                  { label: 'Products', value: MOCK_STORE.products, icon: Package },
                  { label: 'Verified', value: 'Yes', icon: Shield },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springTransition, delay: i * 0.1 }}
                    className="card-premium p-4 text-center"
                  >
                    <stat.icon className="w-6 h-6 mx-auto text-primary" />
                    <div className="text-2xl font-bold mt-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>

            {/* Badges */}
            <ScrollReveal>
              <div className="card-premium p-6">
                <h2 className="text-lg font-bold mb-4">Trust Badges</h2>
                <div className="flex flex-wrap gap-3">
                  {MOCK_STORE.verifiedBadges.map((badge) => (
                    <span
                      key={badge}
                      className="px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Products */}
            <div>
              <h2 className="text-xl font-bold mb-4">Featured Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MOCK_PRODUCTS.map((product, i) => (
                  <ScrollReveal key={product.id} delay={i * 0.1}>
                    <PhysicsCard className="card-premium overflow-hidden group">
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold truncate">{product.name}</h3>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">₹{product.price}</span>
                          <span className="text-sm text-muted-foreground">MOQ: {product.moq}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <Star className="w-4 h-4 text-amber-500 fill-current" />
                          <span>{product.rating}</span>
                          <span className="text-muted-foreground">• {product.sales} sold</span>
                        </div>
                      </div>
                    </PhysicsCard>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ScrollReveal>
              <div className="card-premium p-6">
                <h3 className="font-bold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <span>{MOCK_STORE.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <span>{MOCK_STORE.owner.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <span>{MOCK_STORE.owner.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <a href={MOCK_STORE.website} className="text-primary hover:underline">
                      {MOCK_STORE.website.replace('https://', '')}
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
