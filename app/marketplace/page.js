// app/marketplace/page.js
import { redirect } from 'next/navigation';

export default function MarketplaceLandingPage() {
  redirect('/marketplace/category/all');
}