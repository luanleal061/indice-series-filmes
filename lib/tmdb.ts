const TMDB_BASE = "https://api.themoviedb.org/3";

export function tmdbHeaders() {
  const token = process.env.TMDB_TOKEN;
  if (!token) throw new Error("TMDB_TOKEN não configurado no .env.local");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json;charset=utf-8",
  };
}

export function tmdbLang() {
  return process.env.TMDB_LANGUAGE || "pt-BR";
}

export function tmdbRegion() {
  return process.env.TMDB_REGION || "BR";
}

export function tmdbUrl(
  path: string,
  params?: Record<string, string | number | undefined>
) {
  const url = new URL(TMDB_BASE + path);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}