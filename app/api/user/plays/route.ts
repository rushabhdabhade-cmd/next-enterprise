import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { recordPlay, getPlayHistory } from "@/lib/db"
import type { ITunesTrack } from "@/types/itunes"

export async function GET(req: NextRequest) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 200)
    const plays = await getPlayHistory(userId, limit)
    return NextResponse.json({ plays })
}

export async function POST(req: NextRequest) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const track = await req.json() as ITunesTrack
    await recordPlay(userId, track)

    return NextResponse.json({ ok: true })
}
