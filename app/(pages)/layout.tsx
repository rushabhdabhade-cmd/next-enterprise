import LeftSidebar from "@/components/layout/LeftSidebar"
import Queue from "@/components/playback/Queue"

export default function PagesLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex transition-colors duration-500 relative">
            <LeftSidebar />
            <main className="flex-1 overflow-y-auto scroll-smooth relative">
                {children}
            </main>
            <Queue />
        </div>
    )
}
