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
    <aside className="w-72 bg-white/70 backdrop-blur-md border-l border-purple-100/50 p-6 overflow-y-auto">
      <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
        Queue
      </h2>

      <div className="space-y-3">
        {songs.map((song, i) => (
          <div
            key={i}
            className="flex gap-3 p-2 rounded-xl hover:bg-purple-50 transition cursor-pointer group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex-shrink-0 group-hover:from-purple-200 group-hover:to-pink-200 transition flex items-center justify-center text-xs text-purple-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {song.title}
              </p>
              <p className="text-xs text-gray-500 truncate">{song.artist}</p>
            </div>
            <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
              {song.duration}
            </p>
          </div>
        ))}
      </div>
    </aside>
  )
}