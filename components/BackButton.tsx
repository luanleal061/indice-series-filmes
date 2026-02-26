"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      style={{
        background: "transparent",
        border: "1px solid var(--border)",
        color: "var(--text)",
        padding: "8px 12px",
        borderRadius: 12,
        cursor: "pointer",
      }}
    >
      ← Voltar
    </button>
  );
}