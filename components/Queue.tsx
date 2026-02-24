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
    <aside className="w-72 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-l border-purple-100/50 dark:border-purple-900/50 p-6 overflow-y-auto">
      <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
        Queue
      </h2>

      <div className="space-y-3">
        {songs.map((song, i) => (
          <div
            key={i}
            className="flex gap-3 p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/30 transition cursor-pointer group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-lg flex-shrink-0 group-hover:from-purple-200 dark:group-hover:from-purple-800/50 group-hover:to-pink-200 dark:group-hover:to-pink-800/50 transition flex items-center justify-center text-xs text-purple-400 dark:text-purple-300" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {song.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
              {song.duration}
            </p>
          </div>
        ))}
      </div>
    </aside>
  )
}