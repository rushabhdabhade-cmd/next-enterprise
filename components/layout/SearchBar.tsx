"use client"

import { Loader2, Search, XCircle } from "lucide-react"
import { useState } from "react"
import { SearchTrackParams } from "@/types/itunes"

interface SearchBarProps {
  onSearchComplete?: (count: number) => void
  search: (params: SearchTrackParams) => Promise<import("@/types/itunes").ITunesTrack[]>
  loading: boolean
  error: string | null
}

export default function SearchBar({
  onSearchComplete,
  search,
  loading,
  error,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    try {
      const results = await search({
        term: searchQuery,
        entity: "song",
        limit: 20,
      })

      onSearchComplete?.(results.length)
    } catch {
      // Error is handled in the hook
    }
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto mb-8 md:mb-12">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute left-4 md:left-7 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors">
          {loading ? (
            <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
          ) : (
            <Search className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
          )}
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Artist, song or mood..."
          className="w-full pl-12 pr-14 py-4 md:pl-[4.5rem] md:pr-36 md:py-6 rounded-2xl md:rounded-[32px] bg-gray-50 dark:bg-gray-900 border-none text-gray-950 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base md:text-lg font-light tracking-tight focus:ring-4 focus:ring-pink-500/10 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 shadow-sm"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || !searchQuery.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 md:right-3 md:px-8 md:py-3 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-full font-bold text-xs md:text-sm tracking-tight hover:scale-[1.02] active:scale-[0.98] disabled:opacity-0 disabled:pointer-events-none transition-all duration-300 shadow-xl"
        >
          Explore
        </button>
      </form>

      {error && (
        <div className="mt-4 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl text-sm font-medium border border-red-100 dark:border-red-900/20 animate-in slide-in-from-top-2">
          <XCircle size={18} />
          {error}
        </div>
      )}
    </div>
  )
}
