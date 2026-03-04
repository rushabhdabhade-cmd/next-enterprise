import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTrackById } from "@/services/itunesService"
import TrackDetailClient from "./TrackDetailClient"

// Cache the page at the server level — track metadata almost never changes
export const revalidate = 86400

export async function generateMetadata({
    params,
}: {
    params: { id: string }
}): Promise<Metadata> {
    const { id } = await params
    const track = await getTrackById(Number(id))

    if (!track) return { title: "Track Not Found" }

    const artwork = track.artworkUrl100.replace("100x100", "600x600")

    return {
        title: `${track.trackName} by ${track.artistName}`,
        description: `Listen to ${track.trackName} by ${track.artistName} from ${track.collectionName}. ${track.primaryGenreName} music.`,
        openGraph: {
            title: `${track.trackName} — ${track.artistName}`,
            description: `${track.primaryGenreName} · ${track.collectionName}`,
            images: [{ url: artwork, width: 600, height: 600, alt: track.trackName }],
            type: "music.song",
        },
        twitter: {
            card: "summary_large_image",
            title: `${track.trackName} — ${track.artistName}`,
            description: `${track.primaryGenreName} · ${track.collectionName}`,
            images: [artwork],
        },
    }
}

export default async function TrackDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const track = await getTrackById(Number(id))

    if (!track) notFound()

    return <TrackDetailClient track={track} />
}
