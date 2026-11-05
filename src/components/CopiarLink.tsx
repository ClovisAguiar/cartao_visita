"use client";

import { useState } from "react";

export function CopiarLink({ rotulo, url }: { rotulo: string; url: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold">{rotulo}</p>
      <div className="mt-1.5 flex items-stretch gap-2">
        <input
          readOnly
          value={url}
          aria-label={rotulo}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-2xl border-2 border-ink/15 bg-mist px-3 py-2.5 font-medium text-sm text-ink focus:border-cobalt focus:outline-none"
        />
        <button
          type="button"
          onClick={copiar}
          className="shrink-0 rounded-2xl bg-ink px-4 text-sm font-semibold text-white transition hover:bg-cobalt focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
        >
          <span aria-live="polite">{copiado ? "Copiado" : "Copiar"}</span>
        </button>
      </div>
    </div>
  );
}
