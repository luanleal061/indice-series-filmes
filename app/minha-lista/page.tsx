"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { loadFavorites, FavItem, toggleFavorite } from "@/lib/favorites";

export default function MinhaListaPage() {
  const { data: session } = useSession();
  const email = session?.user?.email;

  const [items, setItems] = useState<FavItem[]>([]);

  useEffect(() => {
    setItems(loadFavorites(email));
  }, [email]);

  const stats = useMemo(() => {
    const movies = items.filter((x) => x.mediaType === "movie").length;
    const tv = items.filter((x) => x.mediaType === "tv").length;
    return { total: items.length, movies, tv };
  }, [items]);

  const remove = (it: FavItem) => {
    const r = toggleFavorite(email, {
      tmdbId: it.tmdbId,
      mediaType: it.mediaType,
      title: it.title,
      poster: it.poster ?? null,
    });
    setItems(r.items);
  };

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <Link href="/" style={{ textDecoration: "none" }}>← Voltar</Link>
        <div style={{ color: "var(--muted)", fontSize: 12 }}>
          Total: <b>{stats.total}</b> • Filmes: <b>{stats.movies}</b> • Séries: <b>{stats.tv}</b>
        </div>
      </div>

      <h1 style={{ marginTop: 12 }}>Minha Lista</h1>

      {!session ? (
        <p style={{ color: "var(--muted)" }}>
          Você não está logado. Salvando como <b>guest</b> neste navegador.
        </p>
      ) : (
        <p style={{ color: "var(--muted)" }}>
          Logado como <b>{email}</b> — seus favoritos ficam salvos neste navegador.
        </p>
      )}

      {items.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Sua lista está vazia. Favorite alguns títulos 😊</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
          {items.map((it) => (
            <div
              key={`${it.mediaType}-${it.tmdbId}`}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 16,
                overflow: "hidden",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <Link href={`/titulo/${it.mediaType}/${it.tmdbId}`} style={{ textDecoration: "none" }}>
                <div style={{ background: "#0f1016", aspectRatio: "2/3" }}>
                  {it.poster ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w342${it.poster}`}
                      alt={it.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : null}
                </div>
                <div style={{ padding: 10, fontWeight: 800 }}>{it.title}</div>
              </Link>

              <div style={{ padding: 10, paddingTop: 0 }}>
                <button
                  onClick={() => remove(it)}
                  style={{
                    width: "100%",
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--text)",
                    padding: "10px 12px",
                    borderRadius: 12,
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  Remover da lista
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}