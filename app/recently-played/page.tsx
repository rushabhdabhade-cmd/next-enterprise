"use client"

import { Clock } from "lucide-react"
import LeftSidebar from "@/components/layout/LeftSidebar"
import Queue from "@/components/playback/Queue"
import RecentlyPlayedContent from "@/components/catalog/RecentlyPlayedContent"

export default function RecentlyPlayedPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex transition-colors duration-500 relative">
            <LeftSidebar />

            <main className="flex-1 overflow-y-auto scroll-smooth">
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
            </main>

            <Queue />
        </div>
    )
}
