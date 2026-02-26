export function SkeletonCard() {
  return (
    <div
      style={{
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: "var(--panel)",
      }}
    >
      <div style={{ aspectRatio: "2/3", background: "rgba(255,255,255,0.06)" }} />
      <div style={{ padding: 10 }}>
        <div style={{ height: 14, width: "75%", background: "rgba(255,255,255,0.06)", borderRadius: 8 }} />
        <div style={{ marginTop: 10, height: 12, width: "55%", background: "rgba(255,255,255,0.06)", borderRadius: 8 }} />
      </div>
    </div>
  );
}