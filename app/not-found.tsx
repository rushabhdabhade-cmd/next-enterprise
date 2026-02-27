import Link from "next/link"
import { Music, Home, Search } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: "40px 40px",
                }} />
            </div>

            {/* Gradient glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 text-center px-6 max-w-lg">
                {/* Icon */}
                <div className="w-24 h-24 bg-pink-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                    <Music size={40} className="text-pink-500" />
                </div>

                {/* 404 text */}
                <h1 className="text-[120px] md:text-[160px] font-black leading-none tracking-tighter bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent select-none">
                    404
                </h1>

                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mt-4 mb-3">
                    Track not found
                </h2>

                <p className="text-gray-500 dark:text-gray-400 font-medium text-base md:text-lg max-w-sm mx-auto mb-10">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved to another playlist.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-8 py-3.5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                    >
                        <Home size={16} />
                        Go Home
                    </Link>
                    <Link
                        href="/search"
                        className="flex items-center gap-2 px-8 py-3.5 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl font-bold text-sm border border-gray-200 dark:border-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Search size={16} />
                        Search Music
                    </Link>
                </div>
            </div>
        </div>
    )
}
