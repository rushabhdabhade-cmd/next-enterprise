"use client"

import { useState } from "react"
import { SearchTrackParams } from "@/types/itunes"
import { SearchTrackParams, ITunesTrack } from "@/types/itunes"

interface SearchBarProps {
  onSearchComplete?: (count: number) => void
  search: (params: SearchTrackParams) => Promise<ITunesTrack[]>
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
    <div className="relative w-full max-w-4xl mx-auto mb-12">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors">
          {loading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <Search size={24} strokeWidth={1.5} />
          )}
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Artist, song or mood..."
          className="w-full pl-16 pr-32 py-6 rounded-[32px] bg-gray-50 dark:bg-gray-900 border-none text-gray-950 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg font-light tracking-tight focus:ring-4 focus:ring-pink-500/10 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 shadow-sm"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || !searchQuery.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-full font-bold text-sm tracking-tight hover:scale-[1.02] active:scale-[0.98] disabled:opacity-0 disabled:pointer-events-none transition-all duration-300 shadow-xl"
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
