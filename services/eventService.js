// services/eventService.js — Lightweight expo/event service
// Uses existing data patterns with client-side demo data for MVP
// Events stored in a lightweight format compatible with existing architecture

import { supabase } from '@/lib/supabase';

// MVP: Demo events data for expo/trade show listings
// These would be stored in a 'events' table in production
const DEMO_EVENTS = [
  {
    id: 'expo-2025-delhi',
    title: 'India B2B Supply Chain Expo 2025',
    description: 'India\'s premier B2B supply chain exhibition connecting manufacturers, distributors, and retailers across 50+ industries. Features live product demos, networking sessions, and keynote speakers from top Indian enterprises.',
    location: 'Pragati Maidan, New Delhi',
    city: 'Delhi',
    date_start: '2025-08-15',
    date_end: '2025-08-18',
    industry: 'Manufacturing',
    organizer: 'India Trade Promotion Organisation',
    attendee_count: 5200,
    exhibitor_count: 350,
    status: 'upcoming',
    image_url: null,
    tags: ['manufacturing', 'supply-chain', 'B2B', 'trade-show'],
    sessions: [
      { title: 'Opening Keynote: Future of Indian Manufacturing', time: '10:00 AM', speaker: 'Dr. Rajesh Kumar' },
      { title: 'Panel: Scaling MSMEs Through Digital Platforms', time: '2:00 PM', speaker: 'Industry Leaders Panel' },
      { title: 'Workshop: Export Compliance for New Businesses', time: '4:00 PM', speaker: 'DGFT Representatives' },
    ],
    booths: [
      { company: 'TechMfg Solutions', industry: 'Electronics', booth: 'A-101', products: ['PCB Assembly', 'IoT Devices'] },
      { company: 'GreenPack India', industry: 'Packaging', booth: 'B-205', products: ['Eco Packaging', 'Custom Boxes'] },
      { company: 'SpiceCraft Co.', industry: 'Food', booth: 'C-310', products: ['Organic Spices', 'Ready Mixes'] },
    ],
  },
  {
    id: 'startup-connect-mumbai',
    title: 'Startup Connect Mumbai 2025',
    description: 'A focused networking event bringing together startups, angel investors, and corporate innovation teams. Pitch competitions, one-on-one meetings, and curated matchmaking sessions.',
    location: 'Jio World Convention Centre, Mumbai',
    city: 'Mumbai',
    date_start: '2025-09-05',
    date_end: '2025-09-06',
    industry: 'Technology',
    organizer: 'Mumbai Startup Ecosystem Foundation',
    attendee_count: 2800,
    exhibitor_count: 120,
    status: 'upcoming',
    image_url: null,
    tags: ['startups', 'investing', 'networking', 'tech'],
    sessions: [
      { title: 'Pitch Day: Top 20 Startups', time: '11:00 AM', speaker: 'Selected Founders' },
      { title: 'Fireside Chat: Building for Bharat', time: '3:00 PM', speaker: 'Startup Ecosystem Leaders' },
    ],
    booths: [
      { company: 'FinEdge Tech', industry: 'Fintech', booth: 'S-01', products: ['Payment Gateway', 'Lending Platform'] },
      { company: 'AgriLink', industry: 'AgriTech', booth: 'S-05', products: ['Farm-to-Market Platform'] },
    ],
  },
  {
    id: 'msme-expo-bangalore',
    title: 'MSME Growth Expo Bangalore',
    description: 'Empowering micro, small, and medium enterprises with access to buyers, technology partners, and government schemes. Features live product showcases and B2B matchmaking.',
    location: 'BIEC, Bangalore',
    city: 'Bangalore',
    date_start: '2025-10-12',
    date_end: '2025-10-14',
    industry: 'Multi-sector',
    organizer: 'MSME Development Institute',
    attendee_count: 4100,
    exhibitor_count: 280,
    status: 'upcoming',
    image_url: null,
    tags: ['MSME', 'government', 'growth', 'multi-sector'],
    sessions: [
      { title: 'Government Schemes for MSMEs', time: '10:30 AM', speaker: 'Ministry Officials' },
      { title: 'Digital Transformation for Small Business', time: '2:30 PM', speaker: 'Tech Partners Panel' },
    ],
    booths: [
      { company: 'HandloomHub', industry: 'Textiles', booth: 'M-12', products: ['Silk Fabrics', 'Designer Sarees'] },
      { company: 'NutriFarm', industry: 'Food Processing', booth: 'M-25', products: ['Organic Snacks', 'Health Drinks'] },
    ],
  },
  {
    id: 'textile-fair-surat',
    title: 'Indian Textile & Apparel Fair',
    description: 'The largest textile sourcing event in Western India. Connecting fabric manufacturers, garment exporters, and retail chains with thousands of textile producers.',
    location: 'Surat International Exhibition Centre',
    city: 'Surat',
    date_start: '2025-11-20',
    date_end: '2025-11-23',
    industry: 'Textiles',
    organizer: 'Textile Association of India',
    attendee_count: 8500,
    exhibitor_count: 600,
    status: 'upcoming',
    image_url: null,
    tags: ['textiles', 'apparel', 'sourcing', 'export'],
    sessions: [
      { title: 'Sustainable Textiles: The Next Wave', time: '10:00 AM', speaker: 'Industry Experts' },
      { title: 'Export Markets & Compliance', time: '3:00 PM', speaker: 'Export Promotion Council' },
    ],
    booths: [],
  },
];

/**
 * Fetch all events with filters
 */
export async function fetchEvents({
  industry = null,
  city = null,
  status = 'upcoming',
  searchTerm = null,
  page = 0,
  pageSize = 12,
} = {}) {
  let events = [...DEMO_EVENTS];

  if (industry) events = events.filter((e) => e.industry.toLowerCase().includes(industry.toLowerCase()));
  if (city) events = events.filter((e) => e.city.toLowerCase().includes(city.toLowerCase()));
  if (status) events = events.filter((e) => e.status === status);
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    events = events.filter((e) =>
      e.title.toLowerCase().includes(term) ||
      e.description.toLowerCase().includes(term) ||
      e.tags.some((t) => t.includes(term))
    );
  }

  const from = page * pageSize;
  const to = from + pageSize;
  const paginated = events.slice(from, to);

  return {
    events: paginated,
    total: events.length,
    hasMore: to < events.length,
    page,
  };
}

/**
 * Get a single event by ID
 */
export async function getEventById(id) {
  return DEMO_EVENTS.find((e) => e.id === id) || null;
}

/**
 * Get upcoming events count for dashboard
 */
export async function getUpcomingEventsCount() {
  return DEMO_EVENTS.filter((e) => e.status === 'upcoming').length;
}

/**
 * Get event industries for filter
 */
export function getEventIndustries() {
  const industries = [...new Set(DEMO_EVENTS.map((e) => e.industry))];
  return industries.sort();
}

/**
 * Get event cities for filter
 */
export function getEventCities() {
  const cities = [...new Set(DEMO_EVENTS.map((e) => e.city))];
  return cities.sort();
}
