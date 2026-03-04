import type { Metadata } from "next"
import { getSharedLibrary } from "@/lib/db"
import SharedLibraryClient from "./SharedLibraryClient"

export const revalidate = 300

export async function generateMetadata({
    params,
}: {
    params: { shareId: string }
}): Promise<Metadata> {
    const { shareId } = await params
    const result = await getSharedLibrary(shareId)

    if (!result) return { title: "Shared Library" }

    const trackCount = result.tracks.length

    return {
        title: `${result.library.name} — Shared Library`,
        description:
            result.library.description ||
            `A curated music library with ${trackCount} ${trackCount === 1 ? "track" : "tracks"}.`,
        openGraph: {
            title: result.library.name,
            description:
                result.library.description ||
                `A curated music library with ${trackCount} ${trackCount === 1 ? "track" : "tracks"}.`,
            type: "music.playlist",
        },
        twitter: {
            card: "summary",
            title: result.library.name,
            description:
                result.library.description ||
                `A curated music library with ${trackCount} ${trackCount === 1 ? "track" : "tracks"}.`,
        },
    }
}

export default async function SharedLibraryPage({
    params,
}: {
    params: Promise<{ shareId: string }>
}) {
    const { shareId } = await params
    return <SharedLibraryClient shareId={shareId} />
}
