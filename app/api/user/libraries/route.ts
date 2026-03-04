import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { getCachedLibraries, revalidateLibraries } from "@/lib/cache"
import { createLibrary } from "@/lib/db"

export async function GET() {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const libraries = await getCachedLibraries(userId)
    return NextResponse.json({ libraries })
}

export async function POST(req: NextRequest) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { name, description } = (await req.json()) as { name: string; description?: string }
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 })

    const library = await createLibrary(userId, name.trim(), description)
    if (!library) return NextResponse.json({ error: "Failed to create library" }, { status: 500 })

    revalidateLibraries(userId)
    return NextResponse.json({ library })
}
