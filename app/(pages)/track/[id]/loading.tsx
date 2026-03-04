"use client"

import { ChevronLeft } from "lucide-react"
import { useParams } from "next/navigation"
import { getCachedTrack } from "@/lib/trackNavigationCache"

export default function TrackDetailLoading() {
  const params = useParams()
  const trackId = Number(params.id)
  const track = getCachedTrack(trackId)

  if (track) {
    const highResArtwork = track.artworkUrl100.replace("100x100", "800x800")

    return (
      <div className="relative overflow-hidden min-h-full">
        <div
          className="absolute inset-0 opacity-20 dark:opacity-30 blur-[120px] pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 50%, #db2777 0%, transparent 60%)` }}
        />
        <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-12 relative z-10">
          <div className="mb-8 md:mb-12 flex items-center gap-3 text-sm font-medium text-gray-500">
            <span className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-100 dark:border-gray-800">
              <ChevronLeft size={16} />
            </span>
            Back to Discovery
          </div>

          <div className="flex flex-col lg:flex-row gap-8 md:gap-16 items-center lg:items-end">
            <div className="relative w-full max-w-[280px] md:max-w-[440px] aspect-square flex-shrink-0">
              <img
                src={highResArtwork}
                alt={track.trackName}
                className="w-full h-full rounded-3xl md:rounded-[40px] object-cover shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]"
              />
            </div>

            <div className="flex-1 mb-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-900 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-4 md:mb-6">
                <span className="w-1 h-1 rounded-full bg-pink-500" />
                {track.primaryGenreName}
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-7xl font-light tracking-tight text-gray-900 dark:text-white mb-3 md:mb-4 leading-tight">
                {track.trackName}
              </h1>

              <p className="text-lg md:text-2xl text-gray-500 dark:text-gray-400 font-light mb-6 md:mb-10">
                by <span className="text-gray-900 dark:text-white font-medium">{track.artistName}</span>
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4">
                <div className="px-6 py-3 md:px-10 md:py-4 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-full font-semibold text-sm md:text-base flex items-center gap-2">
                  Loading...
                </div>
              </div>
            </div>
          </div>

          {/* Skeleton for metadata grid */}
          <div className="mt-12 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 border-t border-gray-100 dark:border-gray-900 pt-8 md:pt-16 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
                <div className="h-5 w-40 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Cold load — no cached data, show full skeleton
  return (
    <div className="relative overflow-hidden min-h-full">
      <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-12">
        <div className="mb-8 md:mb-12 flex items-center gap-3 text-sm font-medium text-gray-400">
          <span className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-100 dark:border-gray-800">
            <ChevronLeft size={16} />
          </span>
          Back to Discovery
        </div>

        <div className="flex flex-col lg:flex-row gap-8 md:gap-16 items-center lg:items-end animate-pulse">
          <div className="w-full max-w-[280px] md:max-w-[440px] aspect-square bg-gray-100 dark:bg-gray-800 rounded-3xl md:rounded-[40px]" />

          <div className="flex-1 mb-4 text-center lg:text-left space-y-4 w-full">
            <div className="h-5 w-24 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto lg:mx-0" />
            <div className="h-12 md:h-16 w-3/4 bg-gray-100 dark:bg-gray-800 rounded-2xl mx-auto lg:mx-0" />
            <div className="h-6 w-48 bg-gray-100 dark:bg-gray-800 rounded-xl mx-auto lg:mx-0" />
            <div className="h-12 w-40 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto lg:mx-0" />
          </div>
        </div>

        <div className="mt-12 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 border-t border-gray-100 dark:border-gray-900 pt-8 md:pt-16 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
              <div className="h-5 w-40 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
