interface Item {
  name: string
  artist: string
  imageUrl?: string
}

interface Props {
  items: Item[]
}

export default function RecentlyPlayedGrid({ items }: Props) {
  return (
    <div className="grid grid-cols-6 gap-6">
      {items.map((item, i) => (
        <div key={i} className="group cursor-pointer">
          <div className="h-40 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl mb-3 overflow-hidden flex items-center justify-center text-gray-400 text-xs group-hover:from-purple-200 group-hover:to-pink-200 transition shadow-sm group-hover:shadow-md">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              "[Image]"
            )}
          </div>
          <p className="text-sm font-medium text-gray-900 truncate">
            {item.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {item.artist}
          </p>
        </div>
      ))}
    </div>
  )
}