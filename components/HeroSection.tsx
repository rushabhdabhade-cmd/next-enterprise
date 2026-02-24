interface HeroSectionProps {
  title?: string
  subtitle?: string
}

export default function HeroSection({
  title = "Welcome to the Music Hub",
  subtitle = "Search and discover your favorite tracks",
}: HeroSectionProps) {
  return (
    <div className="relative h-64 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_white,transparent_50%)]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-400/20 to-transparent rounded-full -mr-48 -mt-48" />

      <div className="absolute inset-0 flex flex-col justify-end p-8">
        <h1 className="text-4xl font-bold text-white mb-1">{title}</h1>
        <p className="text-pink-100 text-sm mb-6">{subtitle}</p>
        <div className="flex gap-2 w-fit">
          <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full hover:from-purple-600 hover:to-pink-600 transition text-sm shadow-lg hover:shadow-xl">
            ▶ Play
          </button>
          <button className="px-4 py-2 border-2 border-white text-white rounded-full hover:bg-white/10 transition backdrop-blur-sm">
            ♡
          </button>
        </div>
      </div>
    </div>
  )
}