// app/products/[id]/loading.js
export default function Loading() {
    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-orange-200 rounded-xl" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
        </main>
    );
}