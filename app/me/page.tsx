"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { FavItem, loadFavorites } from "@/lib/favorites";

export default function MePage() {
  const { data: session, status } = useSession();
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

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <Link href="/" style={{ textDecoration: "none" }}>← Voltar</Link>

      <h1 style={{ marginTop: 12 }}>Meu perfil</h1>

      {status === "loading" ? (
        <p style={{ color: "var(--muted)" }}>Carregando sessão...</p>
      ) : !session ? (
        <div
          style={{
            marginTop: 12,
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 14,
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <p style={{ marginTop: 0 }}>
            Você não está logado. Faça login para ver seu perfil.
          </p>
          <p style={{ color: "var(--muted)" }}>
            Mesmo sem login, sua lista pode existir como <b>guest</b> neste navegador.
          </p>
          <Link href="/minha-lista">Ir para Minha Lista</Link>
        </div>
      ) : (
        <div
          style={{
            marginTop: 12,
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 14,
            background: "rgba(255,255,255,0.02)",
            display: "flex",
            gap: 14,
            alignItems: "center",
          }}
        >
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name ?? "Usuário"}
              width={64}
              height={64}
              style={{ borderRadius: 999, border: "1px solid var(--border)" }}
            />
          ) : null}

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{session.user?.name || "Sem nome"}</div>
            <div style={{ color: "var(--muted)" }}>{email}</div>

            <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 13 }}>
              Favoritos neste navegador: <b>{stats.total}</b> • Filmes: <b>{stats.movies}</b> • Séries: <b>{stats.tv}</b>
            </div>
          </div>

          <Link
            href="/minha-lista"
            style={{
              textDecoration: "none",
              border: "1px solid var(--border)",
              padding: "10px 12px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.03)",
              fontWeight: 900,
            }}
          >
            Minha Lista
          </Link>
        </div>
      )}
    </main>
  );
}