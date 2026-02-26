"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { MediaCard } from "@/components/MediaCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { RowCarousel } from "@/components/RowCarousel";

type Item = {
  id: number;
  media_type: "movie" | "tv" | string;
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
};

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ começa lendo da URL
  const initialQ = searchParams.get("q") ?? "";
  const initialFilter = (searchParams.get("filter") as "all" | "movie" | "tv") ?? "all";

  const [q, setQ] = useState(initialQ);
  const [filter, setFilter] = useState<"all" | "movie" | "tv">(
    initialFilter === "movie" || initialFilter === "tv" || initialFilter === "all" ? initialFilter : "all"
  );

  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState<Item[]>([]);
  const [trendingTv, setTrendingTv] = useState<Item[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const debounced = useDebounce(q, 350);

  // ✅ sempre que q/filter mudar, atualiza a URL (sem recarregar)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (q.trim()) params.set("q", q.trim());
    else params.delete("q");

    params.set("filter", filter);

    router.replace(`/?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filter]);

  // ✅ busca quando debounced muda
  useEffect(() => {
    const run = async () => {
      const query = debounced.trim();

      if (!query) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await r.json();
        setResults(Array.isArray(data.results) ? data.results : []);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [debounced]);

useEffect(() => {
  const load = async () => {
    if (q.trim()) return; // se estiver pesquisando, não carrega carrossel

    setTrendingLoading(true);
    try {
      const [m, t] = await Promise.all([
        fetch("/api/trending?type=movie").then((r) => r.json()),
        fetch("/api/trending?type=tv").then((r) => r.json()),
      ]);

      setTrendingMovies(Array.isArray(m.results) ? m.results : []);
      setTrendingTv(Array.isArray(t.results) ? t.results : []);
    } finally {
      setTrendingLoading(false);
    }
  };

  load();
}, [q]);

  const safeResults = useMemo(() => {
    const base = results.filter(
      (it) =>
        (it.media_type === "movie" || it.media_type === "tv") &&
        typeof it.id === "number" &&
        Number.isFinite(it.id)
    );

    if (filter === "all") return base;
    return base.filter((it) => it.media_type === filter);
  }, [results, filter]);

  const titleOf = (it: Item) =>
    (it.media_type === "movie" ? it.title : it.name) || "Sem título";

  const dateOf = (it: Item) =>
    (it.media_type === "movie" ? it.release_date : it.first_air_date) || "—";

  const hero = safeResults[0];

  return (
    <div>
      <Navbar q={q} setQ={setQ} filter={filter} setFilter={setFilter} />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px 60px" }}>
        {!q.trim() ? (
  <>
    <Intro />
    {trendingLoading ? (
      <p style={{ color: "var(--muted)", marginTop: 14 }}>Carregando títulos em alta...</p>
    ) : (
      <>
        <RowCarousel title="Em alta hoje (Filmes)" items={trendingMovies as any} />
        <RowCarousel title="Em alta hoje (Séries)" items={trendingTv as any} />
      </>
    )}
  </>
) : hero ? (
  <Hero
    title={titleOf(hero)}
    subtitle={dateOf(hero)}
    posterPath={hero.poster_path}
    type={hero.media_type as any}
    id={hero.id}
  />
) : null}

        <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>{q.trim() ? "Resultados" : "Comece buscando um título"}</h2>
          <div style={{ color: "var(--muted)", fontSize: 12 }}>{q.trim() ? `${safeResults.length} encontrados` : ""}</div>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 14,
          }}
        >
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
            : safeResults.map((it) => (
                <MediaCard
                  key={`${it.media_type}-${it.id}`}
                  type={it.media_type as "movie" | "tv"}
                  id={it.id}
                  title={titleOf(it)}
                  subtitle={dateOf(it)}
                  posterPath={it.poster_path}
                />
              ))}
        </div>
      </main>
    </div>
  );
}

function Intro() {
  return (
    <section
      style={{
        border: "1px solid var(--border)",
        borderRadius: 20,
        background: "linear-gradient(135deg, rgba(229,9,20,0.18), rgba(17,18,24,0.85))",
        padding: 18,
      }}
    >
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: "rgba(229,9,20,0.25)",
            border: "1px solid rgba(229,9,20,0.35)",
            display: "grid",
            placeItems: "center",
            fontWeight: 900,
          }}
        >
          N
        </div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Seu catálogo pessoal</div>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>Busque filmes e séries, veja detalhes e onde assistir.</div>
        </div>
      </div>
    </section>
  );
}

function Hero({
  title,
  subtitle,
  posterPath,
  type,
  id,
}: {
  title: string;
  subtitle: string;
  posterPath?: string | null;
  type: "movie" | "tv";
  id: number;
}) {
  return (
    <section
      style={{
        border: "1px solid var(--border)",
        borderRadius: 20,
        overflow: "hidden",
        background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 14 }}>
        <div style={{ background: "#0f1016", aspectRatio: "2/3" }}>
          {posterPath ? (
            <img
              src={`https://image.tmdb.org/t/p/w342${posterPath}`}
              alt={title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : null}
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ color: "var(--accent)", fontWeight: 800, fontSize: 12 }}>DESTAQUE</div>
          <h1 style={{ margin: "6px 0 6px", fontSize: 26 }}>{title}</h1>
          <div style={{ color: "var(--muted)", marginBottom: 12 }}>{subtitle}</div>
          <a
            href={`/titulo/${type}/${id}`}
            style={{
              display: "inline-block",
              background: "var(--accent)",
              color: "white",
              padding: "10px 14px",
              borderRadius: 14,
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            Ver detalhes
          </a>
        </div>
      </div>
    </section>
  );
}

function useDebounce<T>(value: T, delayMs: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return v;
}