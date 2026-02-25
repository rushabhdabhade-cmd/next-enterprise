"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import LeftSidebar from "@/components/LeftSidebar"
import HeroSection from "@/components/HeroSection"
import RecentlyPlayedContent from "@/components/RecentlyPlayedContent"
import Queue from "@/components/Queue"
import ThemeToggle from "@/components/ThemeToggle"
import SearchBar from "@/components/SearchBar"
import TrackList from "@/components/TrackList"
import HotSection from "@/components/HotSection"
import { useItunesSearch } from "@/hooks/useItunesSearch"
import { Sparkles, Compass, History, Star, ChevronLeft, ChevronRight, MoreHorizontal, Flame } from "lucide-react"

const ITEMS_PER_PAGE = 20
const MAX_PAGES = 20

export default function Home() {
  const { tracks, loading, error, search, fetchTopTracks } = useItunesSearch()
  const [activeTab, setActiveTab] = useState<"explore" | "trending" | "recent" | "recommended">("explore")
  const [currentPage, setCurrentPage] = useState(1)
  const hasFetched = useRef(false)
  const exploreHeaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    const loadInitialData = async () => {
      try {
        console.log("Home: Initializing 20-page discovery engine...")
        await fetchTopTracks()
      } catch (err) {
        console.warn("Home: Multi-feed load failed, falling back...", err)
        await search({ term: "Chart Hits", entity: "song", limit: 200 })
      }
    }

    loadInitialData()
  }, [fetchTopTracks, search])

  // Pagination Logic
  const totalPages = Math.min(MAX_PAGES, Math.ceil(tracks.length / ITEMS_PER_PAGE))

  const paginatedTracks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return tracks.slice(start, start + ITEMS_PER_PAGE)
  }, [tracks, currentPage])

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)

    // Smooth scroll back to the search/header area
    if (exploreHeaderRef.current) {
      exploreHeaderRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const firstTrack = tracks?.[0]
  const heroTitle = firstTrack ? `Discover ${firstTrack.artistName}` : "Curated for you"
  const heroSubtitle = firstTrack ? `The evolution of sound across ${firstTrack.primaryGenreName}.` : "Explore fresh tracks and timeless classics."

  const tabs = [
    { id: "explore", name: "Explore", icon: Compass },
    { id: "trending", name: "Trending", icon: Flame },
    { id: "recent", name: "Recently Played", icon: History },
    { id: "recommended", name: "For You", icon: Sparkles },
  ]

  // Pagination Window Logic
  const renderPageButtons = () => {
    const buttons = []
    const windowSize = 4

    let startPage = Math.max(1, currentPage - 1)
    let endPage = Math.min(totalPages, startPage + windowSize - 1)

    if (endPage - startPage < windowSize - 1) {
      startPage = Math.max(1, endPage - windowSize + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-10 h-10 rounded-2xl text-[13px] font-bold transition-all duration-300 ${currentPage === i
            ? "bg-pink-500 text-white shadow-xl shadow-pink-500/25 scale-110"
            : "text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900"
            }`}
        >
          {i}
        </button>
      )
    }
    return buttons
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex transition-colors duration-500 relative">
      <LeftSidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth">
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
                onClick={() => {
                  setActiveTab(tab.id as any)
                  setCurrentPage(1)
                }}
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
          <div className="space-y-12" ref={exploreHeaderRef}>
            {activeTab === "explore" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <SearchBar search={search} loading={loading} error={error} />
                <div className="mt-12">
                  <TrackList tracks={paginatedTracks} loading={loading} />
                </div>

                {/* Refined Modern Pagination UI */}
                {!loading && tracks.length > ITEMS_PER_PAGE && (
                  <div className="mt-20 flex items-center justify-between py-10 border-t border-gray-100 dark:border-gray-900">
                    <div className="flex flex-col">

                      <p className="text-xs font-bold text-gray-400">
                        Page <span className="text-gray-900 dark:text-white">{currentPage}</span> of {totalPages}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="w-12 h-12 rounded-2xl border border-gray-100 dark:border-gray-900 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-gray-50 dark:hover:bg-gray-900 hover:scale-105 active:scale-95"
                      >
                        <ChevronLeft size={20} />
                      </button>

                      <div className="flex items-center gap-2 bg-gray-50/50 dark:bg-gray-900/50 p-1.5 rounded-[20px] border border-gray-100/50 dark:border-gray-800/50">
                        {renderPageButtons()}

                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <div className="w-10 h-10 flex items-center justify-center text-gray-300">
                            <MoreHorizontal size={16} />
                          </div>
                        )}

                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <button
                            onClick={() => handlePageChange(totalPages)}
                            className={`w-10 h-10 rounded-2xl text-[13px] font-bold transition-all ${currentPage === totalPages
                              ? "bg-pink-500 text-white shadow-xl shadow-pink-500/25"
                              : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                              }`}
                          >
                            {totalPages}
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="w-12 h-12 rounded-2xl border border-gray-100 dark:border-gray-900 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-gray-50 dark:hover:bg-gray-900 hover:scale-105 active:scale-95"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "trending" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <HotSection />
              </div>
            )}

            {/* Other tabs remain the same */}
            {activeTab === "recent" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <RecentlyPlayedContent />
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

      <Queue />
    </div>
  )
}