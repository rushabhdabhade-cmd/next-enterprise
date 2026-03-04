import { Suspense } from "react"
import LeftSidebar from "@/components/layout/LeftSidebar"
import TopHeader from "@/components/layout/TopHeader"
import Queue from "@/components/playback/Queue"

export default function PagesLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex transition-colors duration-500 relative">
            <LeftSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Suspense fallback={<div className="h-20 border-b border-gray-100 dark:border-gray-900 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md" />}>
                    <TopHeader />
                </Suspense>
                <main className="flex-1 overflow-y-auto scroll-smooth relative">
                    {children}
                </main>
            </div>
            <Queue />
        </div>
    )
}
