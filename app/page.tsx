import Link from "next/link"
import LeftSidebar from "components/LeftSidebar"
import HeroSection from "components/HeroSection"
import RecentlyPlayedGrid from "components/RecentlyPlayedGrid"
import Queue from "components/Queue"
import ThemeToggle from "components/ThemeToggle"

export const metadata = {
  title: "iTunes",
}

export default function Home() {
  const songs = [
    { title: "Jumpsuit", artist: "Twenty One Pilots", duration: "0:22" },
    { title: "If You Were A Home", artist: "Nick Carryn", duration: "3:45" },
    { title: "Naive", artist: "The Kooks", duration: "3:12" },
    { title: "NUMB", artist: "XXXTENTACION", duration: "2:56" },
    { title: "All For You", artist: "Years & Years", duration: "3:28" },
    { title: "Up in Flames", artist: "Dvelle", duration: "4:02" },
    { title: "Tchibo", artist: "Volker Schown", duration: "3:15" },
    { title: "Let Me Down Slowly", artist: "Alec Benjamin", duration: "3:41" },
    { title: "Lucky Strike", artist: "Troye Smith", duration: "2:58" },
    { title: "Blood // Water", artist: "Stardon", duration: "3:33" },
    { title: "lovely (with Khalid)", artist: "Billie Eilish", duration: "3:21" },
    { title: "Come Together", artist: "The Beatles", duration: "4:19" },
  ]

  const recentlyPlayedItems = [
    { name: "Feel You So", artist: "Username" },
    { name: "Anyone pt.2", artist: "BTC" },
    { name: "Addicts With a Pen", artist: "Twenty One Pilots" },
    { name: "The night I lost", artist: "Lil Marvin" },
    { name: "Scary Love", artist: "Lara Del Rey" },
    { name: "What you know", artist: "Jack Harlow" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      <LeftSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-purple-100/50 dark:border-purple-900/50 shadow-xl shadow-purple-100/30 dark:shadow-none">
            <HeroSection />
            <div className="border-b border-purple-100/50 dark:border-purple-900/50 px-8 pt-6">
              <div className="flex gap-8">
                <button className="pb-4 text-pink-600 dark:text-pink-400 font-medium border-b-2 border-pink-600 dark:border-pink-400 text-sm">
                  Recently Played
                </button>
                <button className="pb-4 text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 text-sm">
                  Featured
                </button>
                <button className="pb-4 text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 text-sm">
                  Recommended
                </button>
              </div>
            </div>
            <div className="p-8">
              <RecentlyPlayedGrid items={recentlyPlayedItems} />
            </div>
            <div className="px-8 pb-8 flex items-center gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">0:32</span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 dark:from-purple-400 dark:to-pink-500 h-1.5 rounded-full w-1/3" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">3:34</span>
            </div>
          </div>
        </div>
      </main>
      <Queue songs={songs} />
    </div>
  )
}