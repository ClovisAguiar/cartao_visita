"use client";

import { useState } from "react";

export function Compartilhar({ url, titulo }: { url: string; titulo: string }) {
  const [copiado, setCopiado] = useState(false);

  async function compartilhar() {
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
        return;
      } catch {
        // a pessoa cancelou; cai para copiar
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={compartilhar}
      className="w-full rounded-full border-2 border-white/40 px-5 py-3 font-semibold text-white transition hover:bg-white hover:text-cobalt focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <span aria-live="polite">{copiado ? "Link copiado" : "Compartilhar cartão"}</span>
    </button>
  );
}
