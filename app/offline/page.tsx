"use client"

import { WifiOff, RefreshCw } from "lucide-react"

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-br from-gray-500/10 via-blue-500/10 to-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 text-center px-6 max-w-lg">
                {/* Animated icon */}
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                    <WifiOff size={40} className="text-gray-400" />
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
                    You&apos;re offline
                </h1>

                <p className="text-gray-500 dark:text-gray-400 font-medium text-base md:text-lg max-w-sm mx-auto mb-10">
                    Check your internet connection and try again. Your music will be here when you get back.
                </p>

                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                >
                    <RefreshCw size={16} />
                    Retry Connection
                </button>
            </div>
        </div>
    )
}
