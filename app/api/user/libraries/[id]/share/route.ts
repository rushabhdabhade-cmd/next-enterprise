import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { revalidateLibraries } from "@/lib/cache"
import { disableLibraryShare, enableLibraryShare } from "@/lib/db"

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const shareId = await enableLibraryShare(id, userId)

    if (!shareId) return NextResponse.json({ error: "Failed to enable sharing" }, { status: 500 })

    revalidateLibraries(userId)
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/shared/${shareId}`
    return NextResponse.json({ shareId, shareUrl })
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const ok = await disableLibraryShare(id, userId)

    if (!ok) return NextResponse.json({ error: "Failed to disable sharing" }, { status: 500 })

    revalidateLibraries(userId)
    return NextResponse.json({ ok: true })
}
