import { MediaCard } from "@/components/MediaCard";

type Item = {
  id: number;
  media_type: "movie" | "tv";
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
};

export function RowCarousel({
  title,
  items,
}: {
  title: string;
  items: Item[];
}) {
  const titleOf = (it: Item) => (it.media_type === "movie" ? it.title : it.name) || "Sem título";
  const dateOf = (it: Item) =>
    (it.media_type === "movie" ? it.release_date : it.first_air_date) || "—";

  return (
    <section style={{ marginTop: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
        <span style={{ color: "var(--muted)", fontSize: 12 }}>{items.length} títulos</span>
      </div>

      <div
        style={{
          marginTop: 12,
          display: "flex",
          gap: 12,
          overflowX: "auto",
          paddingBottom: 10,
          scrollBehavior: "smooth",
        }}
      >
        {items.map((it) => (
          <div key={`${it.media_type}-${it.id}`} style={{ minWidth: 180, maxWidth: 180 }}>
            <MediaCard
              type={it.media_type}
              id={it.id}
              title={titleOf(it)}
              subtitle={dateOf(it)}
              posterPath={it.poster_path}
            />
          </div>
        ))}
      </div>
    </section>
  );
}