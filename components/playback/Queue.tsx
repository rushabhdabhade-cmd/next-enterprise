"use client"

import { useUser } from "@clerk/nextjs"
import { ChevronLeft, ChevronRight, GripVertical, MoreVertical, Music } from "lucide-react"
import { useState } from "react"
import { formatDuration } from "@/services/itunesService"
import { usePlaybackStore } from "@/store/usePlaybackStore"
import { ITunesTrack } from "@/types/itunes"

const ITEMS_PER_PAGE = 10

export default function Queue() {
  const { isSignedIn } = useUser()
  const { queue, currentTrack, playTrack, isPlaying } = usePlaybackStore()
  const [currentPage, setCurrentPage] = useState(0)

  const totalPages = Math.ceil(queue.length / ITEMS_PER_PAGE)
  const startIndex = currentPage * ITEMS_PER_PAGE
  const currentItems = queue.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1)
  }

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(prev => prev - 1)
  }

  return (
    <aside className="w-80 bg-white dark:bg-gray-950 border-l border-gray-100 dark:border-gray-900 hidden lg:flex flex-col transition-colors duration-500">
      <div className="p-8 flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase">
          Up Next
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-400 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[10px] font-bold text-gray-500 tabular-nums">
            {currentPage + 1}/{totalPages || 1}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-400 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-24">
        {currentItems.length > 0 ? (
          currentItems.map((track: ITunesTrack) => {
            const isCurrent = currentTrack?.trackId === track.trackId
            return (
              <div
                key={track.trackId}
                onClick={() => playTrack(track, undefined, !!isSignedIn)}
                className={`flex items-center gap-3 p-3 rounded-[20px] transition-all cursor-pointer group border ${isCurrent
                  ? "bg-gray-50 dark:bg-gray-900 border-pink-500/20 shadow-sm"
                  : "bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-100 dark:hover:border-gray-800"
                  }`}
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300">
                  <GripVertical size={14} />
                </div>
                <div className="relative w-12 h-12 flex-shrink-0">
                  <img
                    src={track.artworkUrl60}
                    alt={track.trackName}
                    className="w-full h-full rounded-xl object-cover shadow-sm"
                  />
                  {isCurrent && isPlaying && (
                    <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                      <div className="flex gap-0.5 items-end h-3">
                        <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.6s_ease-in-out_infinite]" />
                        <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.8s_ease-in-out_infinite_0.1s]" />
                        <div className="w-0.5 bg-white rounded-full animate-[music-bar_0.7s_ease-in-out_infinite_0.2s]" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${isCurrent ? "text-pink-500" : "text-gray-950 dark:text-white"}`}>
                    {track.trackName}
                  </p>
                  <p className="text-xs text-gray-500 truncate font-medium">{track.artistName}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold text-gray-400 tabular-nums">
                    {formatDuration(track.trackTimeMillis)}
                  </span>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-950 dark:hover:text-white">
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="h-40 flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <Music size={20} />
            </div>
            <p className="text-sm text-gray-400 font-medium">Your queue is empty</p>
            <p className="text-[10px] text-gray-500 mt-1 max-w-[150px]">Songs you play from explore will appear here</p>
          </div>
        )}
      </div>

    </aside>
  )
}