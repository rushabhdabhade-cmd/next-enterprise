import Link from "next/link"

export default function LocalFiles() {
  return (
    <div className="min-h-screen flex items-center justify-center p-12">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-4">Local Files</h1>
        <p className="text-gray-600 mb-6">Placeholder content for Local Files.</p>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded border">Local file {i + 1}</div>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/" className="text-sm text-purple-600">← Back</Link>
        </div>
      </div>
    </div>
  )
}
