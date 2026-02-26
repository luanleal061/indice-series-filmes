import { NextResponse } from "next/server";
import { tmdbHeaders, tmdbLang, tmdbUrl } from "@/lib/tmdb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // movie | tv
  const id = searchParams.get("id");

  if (!type || !id) return NextResponse.json({ error: "type e id são obrigatórios" }, { status: 400 });
  if (type !== "movie" && type !== "tv") return NextResponse.json({ error: "type inválido" }, { status: 400 });

  const url = tmdbUrl(`/${type}/${id}`, {
    language: tmdbLang(),
    append_to_response: "credits,videos,similar",
  });

  const r = await fetch(url, { headers: tmdbHeaders(), next: { revalidate: 3600 } });
  if (!r.ok) return NextResponse.json({ error: "Falha ao buscar detalhes" }, { status: 500 });

  const data = await r.json();
  return NextResponse.json(data);
}