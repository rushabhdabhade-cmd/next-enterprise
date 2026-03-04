import { Music, MoreVertical, GripVertical } from "lucide-react"

interface Song {
  title: string
  artist: string
  duration: string
}

interface Props {
  songs: Song[]
}

export default function Queue({ songs }: Props) {
  return (
    <aside className="w-80 bg-white dark:bg-gray-950 border-l border-gray-100 dark:border-gray-900 hidden lg:flex flex-col transition-colors duration-500">
      <div className="p-8 flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase">
          Up Next
        </h2>
        <button className="text-xs font-bold text-pink-500 hover:text-pink-600 transition-colors uppercase">
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-24">
        {songs.length > 0 ? (
          songs.map((song, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-[20px] hover:bg-gray-50 dark:hover:bg-gray-900 border border-transparent hover:border-gray-100 dark:hover:border-gray-800 transition-all cursor-pointer group"
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300">
                <GripVertical size={14} />
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-xl flex-shrink-0 flex items-center justify-center text-gray-400">
                <Music size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-950 dark:text-white truncate">
                  {song.title}
                </p>
                <p className="text-xs text-gray-500 truncate font-medium">{song.artist}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-bold text-gray-400 tabular-nums">
                  {song.duration}
                </span>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-950 dark:hover:text-white">
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="h-40 flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <Music size={20} />
            </div>
            <p className="text-sm text-gray-400 font-medium">Your queue is empty</p>
          </div>
        )}
      </div>
    </aside>
  )
}