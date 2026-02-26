import { Suspense } from "react"
import "styles/tailwind.css"
import { PlaybackProvider } from "@/context/PlaybackContext"
import { LibraryProvider } from "@/context/LibraryContext"
import NowPlayingBar from "@/components/NowPlayingBar"
import PostHogPageView from "@/components/PostHogPageView"
import PostHogIdentifier from "@/components/PostHogIdentifier"
import { ClerkProvider } from "@clerk/nextjs"
import UserSync from "@/components/UserSync"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Blocking script: applies dark class before React hydrates on every page.
              Without this, dark mode only works on the home page (where ThemeToggle lives)
              and shows a flash of light mode on load/refresh. */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem('theme'),d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(!t&&d)){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();`,
            }}
          />
        </head>
        <body className="antialiased">
          <UserSync />
          <PostHogIdentifier />
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <PlaybackProvider>
            <LibraryProvider>
              {children}
              <NowPlayingBar />
            </LibraryProvider>
          </PlaybackProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
