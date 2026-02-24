"use client"

import { useState } from "react"
import { SearchTrackParams } from "@/types/itunes"

interface SearchBarProps {
  onSearchComplete?: (count: number) => void
  search: (params: SearchTrackParams) => Promise<any>
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
    <div className="mb-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search songs, artists..."
          className="flex-1 px-4 py-2 rounded-lg border border-purple-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
