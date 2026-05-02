// app/layout.js
import './globals.css';

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
        {children}
      </body>
    </html>
  );
}