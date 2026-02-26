export type FavItem = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  poster?: string | null;
  savedAt: number;
};

function keyFor(email?: string | null) {
  return `favorites:${email || "guest"}`;
}

export function loadFavorites(email?: string | null): FavItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(keyFor(email));
    const arr = raw ? (JSON.parse(raw) as FavItem[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveFavorites(email: string | null | undefined, items: FavItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(keyFor(email), JSON.stringify(items));
}

export function isFavorited(email: string | null | undefined, tmdbId: number, mediaType: "movie" | "tv") {
  const items = loadFavorites(email);
  return items.some((x) => x.tmdbId === tmdbId && x.mediaType === mediaType);
}

export function toggleFavorite(
  email: string | null | undefined,
  item: Omit<FavItem, "savedAt">
): { items: FavItem[]; nowFavorited: boolean } {
  const items = loadFavorites(email);
  const idx = items.findIndex((x) => x.tmdbId === item.tmdbId && x.mediaType === item.mediaType);

  if (idx >= 0) {
    items.splice(idx, 1);
    saveFavorites(email, items);
    return { items, nowFavorited: false };
  }

  const next = [{ ...item, savedAt: Date.now() }, ...items];
  saveFavorites(email, next);
  return { items: next, nowFavorited: true };
}