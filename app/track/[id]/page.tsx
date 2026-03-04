import { notFound } from "next/navigation"
import { getTrackById } from "@/services/itunesService"
import TrackDetailClient from "./TrackDetailClient"

// Cache the page at the server level — track metadata almost never changes
export const revalidate = 86400

export default async function TrackDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const track = await getTrackById(Number(id))

    if (!track) notFound()

    return <TrackDetailClient track={track} />
}
