import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CardForm } from "@/components/CardForm";
import { getCard } from "@/lib/getCard";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Editar cartão",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function Page(props: PageProps<"/editar/[slug]">) {
  return (
    <main className="pb-28">
      <header className="bg-cobalt px-4 pt-12 pb-28 text-white">
        <div className="mx-auto max-w-xl">
          <h1 className="font-display text-4xl font-extrabold tracking-tight">Editar cartão</h1>
          <p className="mt-2 text-white/80">Mude o que quiser e salve.</p>
        </div>
      </header>
      <div className="mx-auto -mt-20 max-w-xl px-4">
        <Suspense
          fallback={<div className="h-96 animate-pulse rounded-[2rem] bg-paper" aria-busy="true" />}
        >
          <Editor {...props} />
        </Suspense>
      </div>
    </main>
  );
}

async function Editor({ params, searchParams }: PageProps<"/editar/[slug]">) {
  const { slug } = await params;
  const { k } = await searchParams;
  const token = typeof k === "string" ? k : "";

  const { data: valido } = token
    ? await supabase.rpc("check_edit_token", { p_slug: slug, p_token: token })
    : { data: false };
  const card = valido ? await getCard(slug) : null;

  if (!card) {
    return (
      <div className="rounded-[2rem] bg-paper p-8 shadow-xl shadow-cobalt/10" role="alert">
        <h2 className="font-display text-2xl font-bold">Link de edição inválido</h2>
        <p className="mt-2 text-ink/70">
          Confira se você copiou o link secreto inteiro. Sem ele não é possível alterar o cartão.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-cobalt px-6 py-3 font-bold text-white hover:bg-cobalt-deep"
        >
          Voltar ao início
        </Link>
      </div>
    );
  }

  return <CardForm modo="editar" card={card} token={token} />;
}
