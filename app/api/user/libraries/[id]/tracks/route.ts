import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { revalidateLibraries } from "@/lib/cache"
import { getLibraryTracks, addTrackToLibrary, removeTrackFromLibrary } from "@/lib/db"
import type { ITunesTrack } from "@/types/itunes"

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const tracks = await getLibraryTracks(id, userId)
    return NextResponse.json({ tracks })
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const track = (await req.json()) as ITunesTrack
    const ok = await addTrackToLibrary(id, userId, track)

    if (!ok) return NextResponse.json({ error: "Failed to add track" }, { status: 500 })
    revalidateLibraries(userId)
    return NextResponse.json({ ok: true })
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const { trackId } = (await req.json()) as { trackId: number }
    const ok = await removeTrackFromLibrary(id, userId, trackId)

    if (!ok) return NextResponse.json({ error: "Failed to remove track" }, { status: 500 })
    revalidateLibraries(userId)
    return NextResponse.json({ ok: true })
}
