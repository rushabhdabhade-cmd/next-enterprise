import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { revalidateLibraries } from "@/lib/cache"
import { deleteLibrary, updateLibrary } from "@/lib/db"

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const body = (await req.json()) as { name?: string; description?: string }
    const ok = await updateLibrary(id, userId, body)

    if (!ok) return NextResponse.json({ error: "Failed to update" }, { status: 500 })
    revalidateLibraries(userId)
    return NextResponse.json({ ok: true })
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const ok = await deleteLibrary(id, userId)

    if (!ok) return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
    revalidateLibraries(userId)
    return NextResponse.json({ ok: true })
}
