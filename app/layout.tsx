import type { Metadata } from "next"
import { Suspense } from "react"
import "styles/tailwind.css"
import PostHogIdentifier from "@/components/analytics/PostHogIdentifier"
import PostHogPageView from "@/components/analytics/PostHogPageView"
import UserSync from "@/components/analytics/UserSync"
import StoreInitializer from "@/components/StoreInitializer"
import NowPlayingBar from "@/components/playback/NowPlayingBar"
import { ClerkProvider } from "@clerk/nextjs"

export const metadata: Metadata = {
  title: {
    default: "iTunes - Discover Music",
    template: "%s | iTunes",
  },
  description:
    "Discover trending tracks, build curated libraries, and share your music taste. Powered by iTunes.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "iTunes",
    title: "iTunes - Discover Music",
    description:
      "Discover trending tracks, build curated libraries, and share your music taste.",
  },
  twitter: {
    card: "summary_large_image",
    title: "iTunes - Discover Music",
    description:
      "Discover trending tracks, build curated libraries, and share your music taste.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

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
          <StoreInitializer />
          {children}
          <NowPlayingBar />
        </body>
      </html>
    </ClerkProvider>
  )
}
