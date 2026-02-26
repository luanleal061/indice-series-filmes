import { NextResponse } from "next/server";
import { tmdbHeaders, tmdbRegion, tmdbUrl } from "@/lib/tmdb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // movie | tv
  const id = searchParams.get("id");

  if (!type || !id) {
    return NextResponse.json(
      { error: "type e id são obrigatórios" },
      { status: 400 }
    );
  }

  if (type !== "movie" && type !== "tv") {
    return NextResponse.json({ error: "type inválido" }, { status: 400 });
  }

  const url = tmdbUrl(`/${type}/${id}/watch/providers`);

  const r = await fetch(url, {
    headers: tmdbHeaders(),
    next: { revalidate: 3600 },
  });

  if (!r.ok) {
    const text = await r.text();
    return NextResponse.json(
      { error: "Falha ao buscar providers", detail: text },
      { status: 500 }
    );
  }

  const data = await r.json();
  const region = tmdbRegion();
  const country = data?.results?.[region];

  return NextResponse.json({
    region,
    link: country?.link || null,
    flatrate: country?.flatrate || [],
    rent: country?.rent || [],
    buy: country?.buy || [],
  });
}