import { NextResponse } from "next/server";
import { tmdbHeaders, tmdbLang, tmdbUrl } from "@/lib/tmdb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const page = searchParams.get("page") || "1";

  if (!q) return NextResponse.json({ results: [] });

  const url = tmdbUrl("/search/multi", {
    query: q,
    language: tmdbLang(),
    page,
    include_adult: "false",
  });

  const r = await fetch(url, {
    headers: tmdbHeaders(),
    next: { revalidate: 60 },
  });

  if (!r.ok) {
    const text = await r.text();
    return NextResponse.json(
      { error: "TMDB search error", detail: text },
      { status: 500 }
    );
  }

  const data = await r.json();

  const results = Array.isArray(data.results)
    ? data.results.filter(
        (x: any) => x?.media_type === "movie" || x?.media_type === "tv"
      )
    : [];

  return NextResponse.json({ ...data, results });
}