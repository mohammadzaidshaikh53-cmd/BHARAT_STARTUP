'use client';
import Link from 'next/link';

const formatWhatsAppLink = (number) => {
    if (!number) return '#';
    let cleaned = String(number).replace(/\D/g, '');
    if (!cleaned.startsWith('91')) cleaned = `91${cleaned}`;
    return `https://wa.me/${cleaned}`;
};

export default function WhatsAppButton({ number }) {
    const hasWhatsapp = !!number;
    return (
        <Link
            href={hasWhatsapp ? formatWhatsAppLink(number) : '#'}
            target={hasWhatsapp ? '_blank' : undefined}
            rel={hasWhatsapp ? 'noopener noreferrer' : undefined}
            className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full py-3 px-6 text-base font-medium transition ${hasWhatsapp ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            aria-disabled={!hasWhatsapp}
            onClick={(e) => { if (!hasWhatsapp) e.preventDefault(); }}
        >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.588 2.014.896 3.149.896h.002c3.18 0 5.767-2.586 5.768-5.766.001-3.18-2.585-5.767-5.766-5.768z" />
            </svg>
            {hasWhatsapp ? 'Contact via WhatsApp' : 'No Contact Available'}
        </Link>
    );
}