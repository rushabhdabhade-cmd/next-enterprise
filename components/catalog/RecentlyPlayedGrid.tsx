"use client"

import { useRouter } from "next/navigation"
import { Play, Music } from "lucide-react"

interface Item {
  id: number
  name: string
  artist: string
  imageUrl?: string
}

interface Props {
  items: Item[]
}

export default function RecentlyPlayedGrid({ items }: Props) {
  const router = useRouter()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
      {items.map((item, i) => (
        <div
          key={i}
          onClick={() => router.push(`/track/${item.id}`)}
          className="group cursor-pointer"
        >
          <div className="relative aspect-square rounded-[32px] overflow-hidden bg-gray-100 dark:bg-gray-900 mb-4 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/10 group-hover:-translate-y-2">
            {item.imageUrl ? (
              <img
                src={item.imageUrl.replace("100x100", "400x400")}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Music size={40} />
              </div>
            )}

            {/* Play Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-950 scale-75 group-hover:scale-100 transition-transform duration-500 shadow-xl">
                <Play fill="currentColor" size={20} className="ml-1" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-gray-950 dark:text-white truncate group-hover:text-pink-500 transition-colors">
              {item.name}
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate uppercase tracking-wider">
              {item.artist}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}