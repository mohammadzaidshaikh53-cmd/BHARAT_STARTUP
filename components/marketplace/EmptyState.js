import Link from 'next/link';

/**
 * Displays an empty state with a message and optional action link.
 *
 * @param {Object} props
 * @param {string} props.title - Emoji or icon shown large.
 * @param {string} props.message - Main message.
 * @param {string} [props.actionLink] - URL for primary action.
 * @param {string} [props.actionText] - Button label.
 * @param {React.ReactNode} [props.children] - Additional content (e.g., secondary CTAs).
 */
export default function EmptyState({
    icon = '📭',
    title,
    message,
    actionLink,
    actionText,
    children,
}) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">{message}</p>
            <div className="flex flex-wrap justify-center gap-3">
                {actionLink && (
                    <Link
                        href={actionLink}
                        className="px-6 py-2.5 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    >
                        {actionText}
                    </Link>
                )}
                {children}
            </div>
        </div>
    );
}