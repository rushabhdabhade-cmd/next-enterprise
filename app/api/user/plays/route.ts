import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { getCachedPlayHistory, revalidatePlays } from "@/lib/cache"
import { recordPlay } from "@/lib/db"
import type { ITunesTrack } from "@/types/itunes"

export async function GET(req: NextRequest) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 200)
    const plays = await getCachedPlayHistory(userId, limit)
    return NextResponse.json({ plays })
}

export async function POST(req: NextRequest) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const track = await req.json() as ITunesTrack
    await recordPlay(userId, track)
    revalidatePlays(userId)

    return NextResponse.json({ ok: true })
}
