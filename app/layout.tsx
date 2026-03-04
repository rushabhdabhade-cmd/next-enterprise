import "styles/tailwind.css"
import { PlaybackProvider } from "@/context/PlaybackContext"
import NowPlayingBar from "@/components/NowPlayingBar"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PlaybackProvider>
          {children}
          <NowPlayingBar />
        </PlaybackProvider>
      </body>
    </html>
  )
}
