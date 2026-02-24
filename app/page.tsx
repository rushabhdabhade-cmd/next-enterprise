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
import { Sparkles, Compass, History, Star } from "lucide-react"

export default function Home() {
  const { tracks, loading, error, search } = useItunesSearch()
  const [activeTab, setActiveTab] = useState<"explore" | "recent" | "recommended">("explore")

  useEffect(() => {
    const keywords = ["Trending", "Classic", "Hits", "Top", "Electronic", "Acoustic", "Jazz", "Pop", "Rock", "Lofi"]
    const randomTerm = keywords[Math.floor(Math.random() * keywords.length)] || "Hits"

    const timer = setTimeout(() => {
      search({ term: randomTerm, entity: "song", limit: 20 }).catch(() => {
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
  const heroTitle = firstTrack ? `Discover ${firstTrack.artistName}` : "Curated for you"
  const heroSubtitle = firstTrack ? `The evolution of sound across ${firstTrack.primaryGenreName}.` : "Explore fresh tracks and timeless classics."

  const queueSongs = tracks.slice(0, 10).map(track => ({
    title: track.trackName,
    artist: track.artistName,
    duration: formatDuration(track.trackTimeMillis)
  }))

  const tabs = [
    { id: "explore", name: "Explore", icon: Compass },
    { id: "recent", name: "Recently Played", icon: History },
    { id: "recommended", name: "For You", icon: Sparkles },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex transition-colors duration-500 relative">
      <LeftSidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto px-8 py-12 pb-32">

          <header className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-light tracking-tight text-gray-900 dark:text-white">
                Discovery <span className="font-bold">Hub</span>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                Your personalized soundtrack for today
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full border border-gray-100 dark:border-gray-900 flex items-center justify-center opacity-50">
                <Star size={18} />
              </div>
              <ThemeToggle />
            </div>
          </header>

          <div className="rounded-[40px] overflow-hidden border border-gray-100 dark:border-gray-900 shadow-2xl shadow-black/5 dark:shadow-white/5 mb-16">
            <HeroSection title={heroTitle} subtitle={heroSubtitle} />
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-12 border-b border-gray-100 dark:border-gray-900 mb-12">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group pb-6 flex items-center gap-2.5 text-sm font-bold tracking-tight transition-all relative ${activeTab === tab.id
                    ? "text-gray-950 dark:text-white"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? "text-pink-500" : "group-hover:text-pink-400 transition-colors"} />
                {tab.name}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-950 dark:bg-white rounded-full animate-in fade-in slide-in-from-bottom-1" />
                )}
              </button>
            ))}
          </div>

          {/* Dynamic Content Sections */}
          <div className="space-y-12">
            {activeTab === "explore" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <SearchBar search={search} loading={loading} error={error} />
                <div className="mt-12">
                  <TrackList tracks={tracks} loading={loading} />
                </div>
              </div>
            )}

            {activeTab === "recent" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <RecentlyPlayedGrid items={recentlyPlayedItems} />
              </div>
            )}

            {activeTab === "recommended" && (
              <div className="h-64 flex flex-col items-center justify-center text-center p-12 bg-gray-50 dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-700">
                <div className="w-16 h-16 bg-white dark:bg-gray-950 rounded-3xl flex items-center justify-center shadow-xl mb-6">
                  <Sparkles size={28} className="text-pink-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Curating Perfection</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm font-medium leading-relaxed">
                  Our algorithm is learning your acoustic fingerprint. Check back soon for custom picks.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Queue songs={queueSongs} />
    </div>
  )
}