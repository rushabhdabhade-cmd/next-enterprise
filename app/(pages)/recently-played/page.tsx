"use client"

import { Clock } from "lucide-react"
import RecentlyPlayedContent from "@/components/catalog/RecentlyPlayedContent"

export default function RecentlyPlayedPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-6 pb-32 md:px-8 md:py-12">

            {/* Header */}
            <header className="mb-10">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center">
                        <Clock size={16} className="text-blue-500" />
                    </div>
                    <h2 className="text-3xl font-light tracking-tight text-gray-900 dark:text-white">
                        Recently <span className="font-bold">Played</span>
                    </h2>
                </div>
            </header>

            <RecentlyPlayedContent />
        </div>
    )
}
