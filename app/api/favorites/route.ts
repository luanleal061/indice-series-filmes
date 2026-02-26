import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json([]);

  const items = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { tmdbId, mediaType, title, poster } = body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  const fav = await prisma.favorite.upsert({
    where: { userId_tmdbId_mediaType: { userId: user.id, tmdbId, mediaType } },
    update: { title, poster },
    create: { userId: user.id, tmdbId, mediaType, title, poster },
  });

  return NextResponse.json(fav);
}

export async function DELETE(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tmdbId = Number(searchParams.get("tmdbId"));
  const mediaType = String(searchParams.get("mediaType"));

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  await prisma.favorite.delete({
    where: { userId_tmdbId_mediaType: { userId: user.id, tmdbId, mediaType } },
  });

  return NextResponse.json({ ok: true });
}