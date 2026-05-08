'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
    { href: '/marketplace/trending', label: 'Trending' },
    { href: '/marketplace/new-arrivals', label: 'New Arrivals' },
    { href: '/marketplace/deals', label: 'Deals' },
    { href: '/marketplace/saved', label: 'Saved' },
];

/**
 * Navigation tabs for marketplace sub‑routes.
 * Active tab is highlighted with orange underline.
 */
export default function MarketplaceTabs() {
    const pathname = usePathname();

    return (
        <nav
            className="flex gap-1 sm:gap-2 border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar"
            aria-label="Marketplace sections"
        >
            {tabs.map(tab => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`
              relative whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500
              ${isActive
                                ? 'text-orange-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }
            `}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {tab.label}
                        {isActive && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-full" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}