import { useRouter } from "next/navigation"

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
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {items.map((item, i) => (
        <div
          key={i}
          onClick={() => router.push(`/track/${item.id}`)}
          className="group cursor-pointer"
        >
          <div className="h-32 md:h-40 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-xl mb-3 overflow-hidden flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs group-hover:from-purple-200 dark:group-hover:from-purple-800/50 group-hover:to-pink-200 dark:group-hover:to-pink-800/50 transition shadow-sm group-hover:shadow-md">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              "[Image]"
            )}
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {item.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {item.artist}
          </p>
        </div>
      ))}
    </div>
  )
}