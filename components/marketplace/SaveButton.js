'use client';
import { useSaved } from '@/context/SavedContext';

export default function SaveButton({ productId }) {
    const { isSaved, toggleSave } = useSaved();
    const saved = isSaved(productId);

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                toggleSave(productId);
            }}
            className={`absolute top-3 right-3 z-10 p-2 rounded-full transition text-sm ${saved ? 'bg-orange-100 text-orange-600' : 'bg-white/80 text-gray-400 hover:text-orange-500'
                }`}
            aria-label={saved ? 'Unsave' : 'Save'}
        >
            {saved ? '❤️' : '🤍'}
        </button>
    );
}