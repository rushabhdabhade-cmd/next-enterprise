import { Play, Heart, Star } from "lucide-react"

interface HeroSectionProps {
  title?: string
  subtitle?: string
}

export default function HeroSection({
  title = "Discover New Melodies",
  subtitle = "Search and stream your favorite tracks instantly.",
}: HeroSectionProps) {
  return (
    <div className="relative h-80 bg-gray-950 overflow-hidden group">
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 transition-opacity duration-1000">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,#db2777_0%,transparent_50%)] opacity-30" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,#4f46e5_0%,transparent_50%)] opacity-30" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-8 right-12 opacity-20 animate-pulse">
        <Star size={40} className="text-white" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-12 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent">
        <div className="max-w-2xl translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] uppercase tracking-widest font-bold text-pink-400 mb-6 border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            Spotlight
          </div>

          <h1 className="text-5xl md:text-6xl font-light tracking-tight text-white mb-4 leading-tight">
            {title}
          </h1>

          <p className="text-gray-400 text-lg font-light mb-8 max-w-lg leading-relaxed">
            {subtitle}
          </p>

          <div className="flex items-center gap-4">
            <button className="px-10 py-4 bg-white text-gray-950 font-bold rounded-full hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)]">
              <Play fill="currentColor" size={18} />
              Experience Now
            </button>
            <button className="w-14 h-14 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md">
              <Heart size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}