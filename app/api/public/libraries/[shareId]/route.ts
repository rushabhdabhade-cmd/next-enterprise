import { NextRequest, NextResponse } from "next/server"
import { getSharedLibrary } from "@/lib/db"

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ shareId: string }> }
) {
    const { shareId } = await params

    if (!shareId || shareId.length < 8) {
        return NextResponse.json({ error: "Invalid share ID" }, { status: 400 })
    }

    const result = await getSharedLibrary(shareId)

    if (!result) {
        return NextResponse.json({ error: "Library not found or no longer shared" }, { status: 404 })
    }

    return NextResponse.json({
        library: {
            name: result.library.name,
            description: result.library.description,
            cover_url: result.library.cover_url,
        },
        tracks: result.tracks,
    })
}
