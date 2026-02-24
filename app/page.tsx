"use client"

import { useState, useEffect } from "react"
import LeftSidebar from "@/components/LeftSidebar"
import HeroSection from "@/components/HeroSection"
import RecentlyPlayedGrid from "@/components/RecentlyPlayedGrid"
import Queue from "@/components/Queue"
import ThemeToggle from "@/components/ThemeToggle"
import SearchBar from "@/components/SearchBar"
import TrackList from "@/components/TrackList"
import { useItunesSearch } from "@/hooks/useItunesSearch"
import { formatDuration } from "@/services/itunesService"

export default function Home() {
  const { tracks, loading, error, search } = useItunesSearch()
  const [activeTab, setActiveTab] = useState<"explore" | "recent" | "recommended">("explore")

  // Initial search for random songs on mount
  useEffect(() => {
    const keywords = ["Trending", "Classic", "Hits", "Top", "Electronic", "Acoustic", "Jazz", "Pop", "Rock", "Lofi"]
    const randomTerm = keywords[Math.floor(Math.random() * keywords.length)] || "Hits"

    // Add a small delay if it's the first render to ensure network is stable
    const timer = setTimeout(() => {
      search({ term: randomTerm, entity: "song", limit: 20 }).catch(() => {
        // Retry once with a safe fallback if first fails
        search({ term: "Global Hits", entity: "song", limit: 20 })
      })
    }, 100)

    return () => clearTimeout(timer)
  }, [search])

  const recentlyPlayedItems = tracks.slice(6, 12).map((track) => ({
    id: track.trackId,
    name: track.trackName,
    artist: track.artistName,
    imageUrl: track.artworkUrl100,
  }))

  const firstTrack = tracks[0]
  const heroTitle = firstTrack ? `This is ${firstTrack.artistName}` : "Explore trending music"
  const heroSubtitle = firstTrack ? `Featuring tracks like "${firstTrack.trackName}"` : "Discover your next favorite song"

  const queueSongs = tracks.slice(0, 5).map(track => ({
    title: track.trackName,
    artist: track.artistName,
    duration: formatDuration(track.trackTimeMillis)
  }))

  const firstTrackDuration = firstTrack ? formatDuration(firstTrack.trackTimeMillis) : "0:00"

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex transition-colors duration-300">
      <LeftSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-purple-100/50 dark:border-gray-700/50 shadow-xl shadow-purple-100/30 dark:shadow-gray-900/30 transition-colors duration-300">
            <HeroSection title={heroTitle} subtitle={heroSubtitle} />

            {/* Content Tabs */}
            <div className="border-b border-purple-100/50 dark:border-gray-700/50 px-8 pt-6">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab("explore")}
                  className={`pb-4 font-medium border-b-2 text-sm transition-colors ${activeTab === "explore"
                    ? "text-pink-600 dark:text-pink-400 border-pink-600 dark:border-pink-400"
                    : "text-gray-500 dark:text-gray-400 border-transparent hover:text-pink-600 dark:hover:text-pink-400"
                    }`}
                >
                  Explore
                </button>
                <button
                  onClick={() => setActiveTab("recent")}
                  className={`pb-4 font-medium border-b-2 text-sm transition-colors ${activeTab === "recent"
                    ? "text-pink-600 dark:text-pink-400 border-pink-600 dark:border-pink-400"
                    : "text-gray-500 dark:text-gray-400 border-transparent hover:text-pink-600 dark:hover:text-pink-400"
                    }`}
                >
                  Recently Played
                </button>
                <button
                  onClick={() => setActiveTab("recommended")}
                  className={`pb-4 font-medium border-b-2 text-sm transition-colors ${activeTab === "recommended"
                    ? "text-pink-600 dark:text-pink-400 border-pink-600 dark:border-pink-400"
                    : "text-gray-500 dark:text-gray-400 border-transparent hover:text-pink-600 dark:hover:text-pink-400"
                    }`}
                >
                  Recommended
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {activeTab === "explore" && (
                <>
                  <SearchBar search={search} loading={loading} error={error} />
                  <TrackList tracks={tracks} loading={loading} />
                </>
              )}
              {activeTab === "recent" && (
                <RecentlyPlayedGrid items={recentlyPlayedItems} />
              )}
              {activeTab === "recommended" && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    Recommendations based on your taste will appear here soon...
                  </p>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {activeTab === "recent" && firstTrack && (
              <div className="px-8 pb-8 flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  0:00
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-1.5 rounded-full w-0" />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {firstTrackDuration}
                </span>
              </div>
            )}
          </div>
        </div>
      </main>

      <Queue songs={queueSongs} />
    </div>
  )
}