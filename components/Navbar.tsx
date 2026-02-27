"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export function Navbar({
  q,
  setQ,
  filter,
  setFilter,
}: {
  q: string;
  setQ: (v: string) => void;
  filter: "all" | "movie" | "tv";
  setFilter: (v: "all" | "movie" | "tv") => void;
}) {
  const { data: session, status } = useSession();
  const logged = status === "authenticated";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(10px)",
        background: "rgba(11,11,15,0.72)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "14px 16px",
          display: "flex",
          flexWrap: "wrap", // ✅ permite quebrar linha no mobile
          gap: 12,
          alignItems: "center",
        }}
      >
        {/* Linha 1: Logo */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
          <div style={{ fontWeight: 900, letterSpacing: 0.3, whiteSpace: "nowrap" }}>
            <span style={{ color: "var(--accent)" }}>N</span>ÍNDICE
          </div>
          <div style={{ color: "var(--muted)", fontSize: 12 }}>Filmes & Séries</div>
        </div>

        {/* Linha 1: Login (fica na direita no desktop, e não estoura no mobile) */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {logged ? (
            <>
              <Link
                href="/minha-lista"
                style={{
                  textDecoration: "none",
                  border: "1px solid var(--border)",
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.03)",
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                Minha Lista
              </Link>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name ?? "Usuário"}
                    width={28}
                    height={28}
                    style={{ borderRadius: 999, border: "1px solid var(--border)" }}
                  />
                ) : null}

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  style={{
                    border: "1px solid var(--border)",
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "transparent",
                    color: "var(--text)",
                    cursor: "pointer",
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                  }}
                >
                  Sair
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              style={{
                border: "1px solid rgba(229,9,20,0.45)",
                padding: "10px 12px",
                borderRadius: 12,
                background: "rgba(229,9,20,0.18)",
                color: "var(--text)",
                cursor: "pointer",
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              Entrar com Google
            </button>
          )}
        </div>

        {/* Linha 2 (mobile): filtros + busca ocupam 100% */}
        <div
          style={{
            width: "100%",
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              padding: "10px 10px",
              borderRadius: 12,
              outline: "none",
              flex: "0 0 auto",
            }}
          >
            <option value="all">Ambos</option>
            <option value="movie">Filmes</option>
            <option value="tv">Séries</option>
          </select>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar… (ex: Batman)"
            style={{
              flex: "1 1 220px", // ✅ cresce e encolhe
              minWidth: 160,     // ✅ não quebra feio
              width: "auto",     // ✅ remove largura fixa
              background: "var(--panel)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              padding: "10px 12px",
              borderRadius: 14,
              outline: "none",
            }}
          />
        </div>
      </div>
    </header>
  );
}