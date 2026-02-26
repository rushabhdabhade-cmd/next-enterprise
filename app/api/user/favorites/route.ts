import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { getCachedFavorites, revalidateFavorites } from "@/lib/cache"
import { addFavorite, removeFavorite } from "@/lib/db"
import type { ITunesTrack } from "@/types/itunes"

export async function GET() {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const favorites = await getCachedFavorites(userId)
    return NextResponse.json({
        trackIds: favorites.map((f) => f.track_id),
        favorites,
    })
}

export async function POST(req: NextRequest) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const track = await req.json() as ITunesTrack
    await addFavorite(userId, track)
    revalidateFavorites(userId)

    return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { trackId } = await req.json() as { trackId: number }
    await removeFavorite(userId, trackId)
    revalidateFavorites(userId)

    return NextResponse.json({ ok: true })
}
