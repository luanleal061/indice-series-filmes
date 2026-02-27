import Link from "next/link";
import { headers } from "next/headers";
import { BackButton } from "@/components/BackButton";
import { FavoriteButton } from "@/components/FavoriteButton";

type ParamsPromise = Promise<{ type?: string; id?: string }>;

async function getOrigin() {
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

async function getJSON(path: string) {
  const origin = await getOrigin();
  const url = `${origin}${path}`;

  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Erro ${r.status}: ${text}`);
  }
  return r.json();
}

function ratingVerdict(voteAverage?: number, voteCount?: number) {
  const avg = typeof voteAverage === "number" ? voteAverage : 0;
  const count = typeof voteCount === "number" ? voteCount : 0;

  const confidence =
    count >= 2000 ? "alta" : count >= 500 ? "média" : count >= 100 ? "baixa" : "muito baixa";

  let verdict: "Vale a pena" | "Depende" | "Não vale" = "Depende";

  if (avg >= 7.4) verdict = "Vale a pena";
  else if (avg >= 6.3) verdict = "Depende";
  else verdict = "Não vale";

  if (count < 100 && verdict === "Vale a pena") verdict = "Depende";

  return { verdict, confidence };
}

function seriesStatusLabel(status?: string) {
  const s = (status || "").toLowerCase();

  if (s.includes("returning"))
    return { label: "Em exibição (voltará com novos episódios)", isAiring: true };
  if (s.includes("in production")) return { label: "Em produção", isAiring: true };
  if (s.includes("planned")) return { label: "Planejada", isAiring: true };
  if (s.includes("pilot")) return { label: "Piloto", isAiring: true };
  if (s.includes("ended")) return { label: "Finalizada", isAiring: false };
  if (s.includes("canceled") || s.includes("cancelled"))
    return { label: "Cancelada", isAiring: false };

  return { label: status || "Status desconhecido", isAiring: false };
}

export default async function TituloPage({ params }: { params: ParamsPromise }) {
  const { type, id } = await params;

  if (!type || !id) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <Link href="/">← Voltar</Link>
        <h1 style={{ marginTop: 12 }}>Rota inválida</h1>
      </main>
    );
  }

  if (type !== "movie" && type !== "tv") {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <Link href="/">← Voltar</Link>
        <h1 style={{ marginTop: 12 }}>Tipo inválido</h1>
      </main>
    );
  }

  const [details, providers] = await Promise.all([
    getJSON(`/api/details?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`),
    getJSON(`/api/providers?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`),
  ]);

  const title = type === "movie" ? details.title : details.name;

  const voteAverage: number | undefined = details?.vote_average;
  const voteCount: number | undefined = details?.vote_count;
  const { verdict, confidence } = ratingVerdict(voteAverage, voteCount);

  // Série: temporadas + status
  const seasons: number | undefined = type === "tv" ? details?.number_of_seasons : undefined;
  const status: string | undefined = type === "tv" ? details?.status : undefined;
  const lastAir: string | undefined = type === "tv" ? details?.last_air_date : undefined;
  const nextEp: any | null = type === "tv" ? (details?.next_episode_to_air ?? null) : null;
  const statusInfo = type === "tv" ? seriesStatusLabel(status) : null;

  // ✅ ELENCO PRINCIPAL (top 12)
  const cast: any[] = Array.isArray(details?.credits?.cast) ? details.credits.cast.slice(0, 12) : [];

  // ✅ TRAILER
  const videos: any[] = Array.isArray(details?.videos?.results) ? details.videos.results : [];
  const trailer =
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && (v.official === true || v.official === undefined)) ||
    videos.find((v) => v.site === "YouTube" && v.type === "Teaser") ||
    videos.find((v) => v.site === "YouTube");

  const backdropUrl = details?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}`
    : null;

  const posterUrl = details?.poster_path
    ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
    : null;

  return (
    <main
      style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: "clamp(14px, 3vw, 24px)",
        fontFamily: "system-ui",
      }}
    >
      <BackButton />

      {/* ✅ TOPO com proporções boas no mobile */}
      <section className="mobileHeader">
        <div className="mobileBackdrop">
          {backdropUrl ? <img src={backdropUrl} alt={title} /> : <div className="mobileBackdropFallback" />}
          <div className="mobileBackdropShade" />
        </div>

        <div className="mobileInfoCard">
          <div className="mobilePoster">
            {posterUrl ? <img src={posterUrl} alt={title} /> : null}
          </div>

          <div>
            <h1 style={{ margin: 0 }}>{title}</h1>

            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <FavoriteButton tmdbId={Number(id)} mediaType={type} title={title} poster={details.poster_path} />
            </div>

            <p style={{ opacity: 0.85, marginTop: 12 }}>{details.overview || "Sem sinopse."}</p>

            {/* BLOCO: NOTA + VEREDITO */}
            <div
              style={{
                marginTop: 14,
                border: "1px solid var(--border)",
                background: "var(--panel)",
                borderRadius: 16,
                padding: 12,
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span
                  style={{
                    background: "rgba(229,9,20,0.18)",
                    border: "1px solid rgba(229,9,20,0.35)",
                    padding: "6px 10px",
                    borderRadius: 999,
                    fontWeight: 800,
                  }}
                >
                  {verdict}
                </span>

                <span style={{ color: "var(--muted)" }}>
                  Nota TMDB: <b>{typeof voteAverage === "number" ? voteAverage.toFixed(1) : "—"}</b>/10
                  {" · "}
                  Votos: <b>{typeof voteCount === "number" ? voteCount : "—"}</b>
                  {" · "}
                  Confiança: <b>{confidence}</b>
                </span>
              </div>

              <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 13 }}>
                *Isso é baseado na nota dos usuários da TMDB (não é crítica profissional).
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO: SÉRIES */}
      {type === "tv" ? (
        <div
          style={{
            marginTop: 14,
            border: "1px solid var(--border)",
            background: "var(--panel)",
            borderRadius: 16,
            padding: 12,
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Informações da série</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
            <InfoRow label="Temporadas" value={typeof seasons === "number" ? String(seasons) : "—"} />
            <InfoRow label="Status" value={statusInfo?.label || status || "—"} />
            <InfoRow label="Último episódio" value={lastAir || "—"} />
            <InfoRow
              label="Próximo episódio"
              value={nextEp?.air_date ? `${nextEp.air_date}${nextEp.name ? ` — ${nextEp.name}` : ""}` : "—"}
            />
          </div>
        </div>
      ) : null}

      {/* ✅ ELENCO (mantido) */}
      {cast.length > 0 ? (
        <>
          <h3 style={{ marginTop: 18 }}>Elenco principal</h3>

          <div
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              paddingBottom: 10,
              scrollBehavior: "smooth",
            }}
          >
            {cast.map((p: any) => (
              <div
                key={p.id}
                className="castCard"
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div style={{ background: "#0f1016", aspectRatio: "2/3" }}>
                  {p.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${p.profile_path}`}
                      alt={p.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : null}
                </div>

                <div style={{ padding: 10 }}>
                  <div style={{ fontWeight: 900, fontSize: 13, lineHeight: 1.2 }}>{p.name}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 6, lineHeight: 1.2 }}>
                    {p.character || "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {/* ✅ TRAILER (mantido) */}
      {trailer?.key ? (
        <>
          <h3 style={{ marginTop: 18 }}>Trailer</h3>

          <div
            className="trailerCard"
            style={{
              border: "1px solid var(--border)",
              borderRadius: 16,
              overflow: "hidden",
              background: "var(--panel)",
            }}
          >
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" as any }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailer.key}`}
                title={trailer.name || "Trailer"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                  display: "block",
                }}
              />
            </div>

            <div style={{ padding: 12, color: "var(--muted)", fontSize: 13 }}>{trailer.name || "Trailer"}</div>
          </div>
        </>
      ) : null}

      {/* ONDE ASSISTIR */}
      <h3 style={{ marginTop: 18 }}>Onde assistir (Brasil)</h3>
      {!providers?.flatrate?.length && <p>Sem dados de streaming para BR.</p>}

      <ProvidersSection title="Assinatura" items={providers?.flatrate || []} />
      <ProvidersSection title="Aluguel" items={providers?.rent || []} />
      <ProvidersSection title="Compra" items={providers?.buy || []} />
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 10 }}>
      <div style={{ color: "var(--muted)", fontSize: 12 }}>{label}</div>
      <div style={{ fontWeight: 800, marginTop: 4 }}>{value}</div>
    </div>
  );
}

const STREAMING_LINKS: Record<string, string> = {
  Netflix: "https://www.netflix.com",
  "HBO Max": "https://www.hbomax.com",
  "HBO Max Amazon Channel": "https://www.amazon.com/channels",
  "Prime Video": "https://www.primevideo.com",
  "Disney Plus": "https://www.disneyplus.com",
  "Apple TV Plus": "https://tv.apple.com/br",
};

function ProvidersSection({ title, items }: { title: string; items: any[] }) {
  if (!items?.length) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 700 }}>{title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
        {items.map((p) => (
          <a
            key={p.provider_id ?? p.provider_name}
            href={STREAMING_LINKS[p.provider_name] || "#"}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid var(--border)",
              padding: "8px 10px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.02)",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            {p.logo_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                alt={p.provider_name}
                width={22}
                height={22}
                style={{ borderRadius: 6 }}
              />
            ) : null}
            <span>{p.provider_name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}