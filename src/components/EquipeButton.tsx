"use client";

import { useRef } from "react";
import { equipe } from "@/equipe";

export function EquipeButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="fixed right-4 bottom-4 z-40 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-ink/20 transition hover:bg-cobalt focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        Equipe
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="equipe-titulo"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current.close();
        }}
        className="m-auto w-[min(92vw,24rem)] rounded-3xl bg-paper p-0 text-ink backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
      >
        <div className="p-6">
          <h2 id="equipe-titulo" className="font-display text-2xl font-bold">
            Quem fez este app
          </h2>
          <ul className="mt-4 space-y-2">
            {equipe.map((p) => (
              <li key={p.nome} className="rounded-2xl bg-mist px-4 py-3">
                <span className="font-semibold">{p.nome}</span>{" "}
                <span className="text-ink/70">({p.faculdade})</span>
              </li>
            ))}
          </ul>
          <form method="dialog" className="mt-6">
            <button
              type="submit"
              className="w-full rounded-full border-2 border-ink px-4 py-2.5 font-semibold transition hover:bg-ink hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
            >
              Fechar
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
