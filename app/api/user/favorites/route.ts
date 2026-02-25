import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { addFavorite, removeFavorite, getFavorites } from "@/lib/db"
import type { ITunesTrack } from "@/types/itunes"

export async function GET() {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const favorites = await getFavorites(userId)
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

    return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { trackId } = await req.json() as { trackId: number }
    await removeFavorite(userId, trackId)

    return NextResponse.json({ ok: true })
}
