"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("App error:", error)
    }, [error])

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-br from-red-500/15 via-orange-500/10 to-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 text-center px-6 max-w-lg">
                {/* Icon */}
                <div className="w-24 h-24 bg-red-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                    <AlertTriangle size={40} className="text-red-500" />
                </div>

                {/* 500 text */}
                <h1 className="text-[100px] md:text-[140px] font-black leading-none tracking-tighter bg-gradient-to-br from-red-500 via-orange-500 to-yellow-400 bg-clip-text text-transparent select-none">
                    500
                </h1>

                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mt-4 mb-3">
                    Something went wrong
                </h2>

                <p className="text-gray-500 dark:text-gray-400 font-medium text-base max-w-sm mx-auto mb-4">
                    An unexpected error occurred. Our team has been notified.
                </p>

                {error.message && (
                    <div className="mb-8 px-4 py-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl">
                        <p className="text-red-600 dark:text-red-400 text-xs font-mono truncate">
                            {error.message}
                        </p>
                    </div>
                )}

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 px-8 py-3.5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                    >
                        <RotateCcw size={16} />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-8 py-3.5 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl font-bold text-sm border border-gray-200 dark:border-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Home size={16} />
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
