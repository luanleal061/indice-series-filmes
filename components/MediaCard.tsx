import Link from "next/link";

export function MediaCard({
  type,
  id,
  title,
  subtitle,
  posterPath,
}: {
  type: "movie" | "tv";
  id: number;
  title: string;
  subtitle?: string;
  posterPath?: string | null;
}) {
  return (
    <Link
      href={`/titulo/${type}/${id}`}
      style={{
        textDecoration: "none",
        borderRadius: 18,
        overflow: "hidden",
        background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        border: "1px solid var(--border)",
        transform: "translateZ(0)",
        transition: "transform 150ms ease, border-color 150ms ease",
        display: "block",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.03)";
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(229,9,20,0.5)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
      }}
    >
      <div style={{ background: "#0f1016", aspectRatio: "2/3" }}>
        {posterPath ? (
          <img
            src={`https://image.tmdb.org/t/p/w342${posterPath}`}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ height: "100%", display: "grid", placeItems: "center", color: "var(--muted)" }}>
            Sem pôster
          </div>
        )}
      </div>

      <div style={{ padding: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>{title}</div>
        <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
          {type === "movie" ? "Filme" : "Série"} {subtitle ? `• ${subtitle}` : ""}
        </div>
      </div>
    </Link>
  );
}