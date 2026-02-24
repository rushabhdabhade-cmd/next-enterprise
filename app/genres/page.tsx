import Link from "next/link"

export default function Genres() {
  return (
    <div className="min-h-screen flex items-center justify-center p-12">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-4">Genres</h1>
        <p className="text-gray-600 mb-6">Placeholder content for the Genres section.</p>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded flex items-center justify-center">Genre</div>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/" className="text-sm text-purple-600">← Back</Link>
        </div>
      </div>
    </div>
  )
}
