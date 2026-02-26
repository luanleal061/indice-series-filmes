"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { isFavorited, toggleFavorite } from "@/lib/favorites";

export function FavoriteButton({
  tmdbId,
  mediaType,
  title,
  poster,
}: {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  poster?: string | null;
}) {
  const { data: session } = useSession();
  const email = session?.user?.email;

  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorited(email, tmdbId, mediaType));
  }, [email, tmdbId, mediaType]);

  const onToggle = () => {
    const r = toggleFavorite(email, { tmdbId, mediaType, title, poster: poster ?? null });
    setFav(r.nowFavorited);
  };

  return (
    <button
      onClick={onToggle}
      style={{
        border: fav ? "1px solid rgba(229,9,20,0.55)" : "1px solid var(--border)",
        background: fav ? "rgba(229,9,20,0.18)" : "rgba(255,255,255,0.03)",
        color: "var(--text)",
        padding: "10px 12px",
        borderRadius: 12,
        cursor: "pointer",
        fontWeight: 900,
      }}
    >
      {fav ? "✓ Na Minha Lista" : "+ Minha Lista"}
    </button>
  );
}