import { Suspense } from "react"
import "styles/tailwind.css"
import { PlaybackProvider } from "@/context/PlaybackContext"
import NowPlayingBar from "@/components/NowPlayingBar"
import PostHogPageView from "@/components/PostHogPageView"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Suspense fallback={null}>
          <PostHogPageView />
        </Suspense>
        <PlaybackProvider>
          {children}
          <NowPlayingBar />
        </PlaybackProvider>
      </body>
    </html>
  )
}
