// app/layout.js
import './globals.css';
import { Navbar } from '@/components/common/Navbar';
import { Toaster } from 'sonner'; // ✅ added for toast notifications

export const metadata = {
  title: 'Marketplace Chat',
  description: 'Real-time messaging for buyers and sellers',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-bg-base text-text-primary antialiased">
        <Navbar />
        {children}
        {/* ✅ Sonner Toaster – global notifications, positioned top-right with rich colors */}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}