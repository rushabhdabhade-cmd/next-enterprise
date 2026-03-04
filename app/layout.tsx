import { Suspense } from "react"
import "styles/tailwind.css"
import { PlaybackProvider } from "@/context/PlaybackContext"
import NowPlayingBar from "@/components/NowPlayingBar"
import PostHogPageView from "@/components/PostHogPageView"
import PostHogIdentifier from "@/components/PostHogIdentifier"
import { ClerkProvider } from "@clerk/nextjs"
import UserSync from "@/components/UserSync"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          <UserSync />
          <PostHogIdentifier />
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <PlaybackProvider>
            {children}
            <NowPlayingBar />
          </PlaybackProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
