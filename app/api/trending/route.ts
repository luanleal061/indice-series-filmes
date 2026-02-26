import { NextResponse } from "next/server";
import { tmdbHeaders, tmdbLang, tmdbUrl } from "@/lib/tmdb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") || "all") as "all" | "movie" | "tv";
  const page = searchParams.get("page") || "1";

  if (type !== "all" && type !== "movie" && type !== "tv") {
    return NextResponse.json({ error: "type inválido" }, { status: 400 });
  }

  const url = tmdbUrl(`/trending/${type}/day`, {
    language: tmdbLang(),
    page,
  });

  const r = await fetch(url, { headers: tmdbHeaders(), next: { revalidate: 600 } });
  if (!r.ok) {
    const text = await r.text();
    return NextResponse.json({ error: "Falha no trending", detail: text }, { status: 500 });
  }

  const data = await r.json();

  const results = Array.isArray(data.results)
    ? data.results.filter((x: any) => x?.media_type === "movie" || x?.media_type === "tv")
    : [];

  return NextResponse.json({ ...data, results });
}