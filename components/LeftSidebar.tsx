import Link from "next/link"

export default function LeftSidebar() {
  return (
    <aside className="w-56 bg-white/70 backdrop-blur-md border-r border-purple-100/50 p-6 overflow-y-auto">
      <div className="mb-8">
        <div className="inline-block">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            iTunes
          </h1>
        </div>
      </div>

      <nav className="space-y-1 mb-8">
        <Link
          href="/discover"
          className="block px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition text-sm font-medium"
        >
          Discover
        </Link>
        <Link
          href="/genres"
          className="block px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition text-sm font-medium"
        >
          Genres
        </Link>
        <Link
          href="/top-charts"
          className="block px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition text-sm font-medium"
        >
          Top Charts
        </Link>
        <Link
          href="/local-files"
          className="block px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition text-sm font-medium"
        >
          Local Files
        </Link>
      </nav>

      <div className="border-t border-purple-100/50 pt-6">
        <h3 className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">
          Playlists
        </h3>
        <ul className="space-y-1 text-sm">
          <li className="px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition cursor-pointer">
            Favorites
          </li>
          <li className="px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition cursor-pointer">
            History
          </li>
          <li className="px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition cursor-pointer">
            Stations
          </li>
        </ul>
      </div>
    </aside>
  )
}