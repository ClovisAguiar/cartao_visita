import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import QRCode from "qrcode";
import { Compartilhar } from "@/components/Compartilhar";
import { type Card, nomeRede } from "@/lib/cards";
import { getCard } from "@/lib/getCard";
import { fotoUrl } from "@/lib/supabase";

export async function generateMetadata({ params }: PageProps<"/c/[slug]">) {
  const { slug } = await params;
  const card = await getCard(slug);
  if (!card) return { title: "Cartão não encontrado" };
  return {
    title: `${card.nome} | Cartão de visita`,
    description: [card.cargo, card.cidade, card.frase].filter(Boolean).join(". "),
  };
}

export default function Page({ params }: PageProps<"/c/[slug]">) {
  return (
    <main className="min-h-dvh bg-cobalt px-4 pt-8 pb-28 sm:pt-14">
      <Suspense fallback={<Esqueleto />}>
        <Cartao params={params} />
      </Suspense>
    </main>
  );
}

function Esqueleto() {
  return (
    <div className="mx-auto max-w-md animate-pulse rounded-[2rem] bg-paper/90 p-8" aria-busy="true">
      <div className="mx-auto size-32 rounded-full bg-mist" />
      <div className="mx-auto mt-6 h-8 w-2/3 rounded-full bg-mist" />
      <div className="mx-auto mt-3 h-4 w-1/2 rounded-full bg-mist" />
      <span className="sr-only">Carregando cartão…</span>
    </div>
  );
}

function usuarioDoLink(rede: keyof typeof REDES, url: string) {
  try {
    const u = new URL(url);
    if (rede === "whatsapp") {
      const d = u.pathname.replace(/\D/g, "");
      return d.startsWith("55") && d.length >= 12
        ? `(${d.slice(2, 4)}) ${d.slice(4, -4)}-${d.slice(-4)}`
        : `+${d}`;
    }
    return u.pathname.replace(/^\/(in\/)?/, "@").replace(/\/$/, "") || u.hostname;
  } catch {
    return url;
  }
}

const REDES = {
  whatsapp: "bg-[#1f9d55] text-white hover:bg-[#178246]",
  linkedin: "bg-[#0a66c2] text-white hover:bg-[#08539d]",
  github: "bg-ink text-white hover:bg-black",
  instagram: "bg-[#c13584] text-white hover:bg-[#a12b6e]",
} as const;

async function Cartao({ params }: { params: PageProps<"/c/[slug]">["params"] }) {
  const { slug } = await params;
  const card = await getCard(slug);
  if (!card) notFound();

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const url = `${proto}://${host}/c/${card.slug}`;

  const qr = await QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#141a33", light: "#ffffff" },
  });

  const foto = fotoUrl(card.foto_path);
  const links = (Object.keys(REDES) as (keyof typeof REDES)[])
    .map((rede) => ({ rede, url: card[rede as keyof Card] as string | null }))
    .filter((l): l is { rede: keyof typeof REDES; url: string } => Boolean(l.url));

  return (
    <div className="mx-auto max-w-md">
      <article className="rounded-[2rem] bg-paper px-6 pt-8 pb-6 text-center shadow-2xl shadow-black/25">
        <div className="mx-auto size-32 overflow-hidden rounded-full bg-mist ring-4 ring-signal">
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={foto} alt={`Foto de ${card.nome}`} className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center font-display text-5xl font-extrabold text-cobalt">
              {card.nome.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <h1 className="mt-5 font-display text-3xl leading-tight font-extrabold tracking-tight break-words">
          {card.nome}
        </h1>
        {card.cargo && <p className="mt-1 text-lg font-semibold text-cobalt">{card.cargo}</p>}
        {card.cidade && <p className="mt-0.5 text-ink/60">{card.cidade}</p>}
        {card.frase && (
          <p className="mx-auto mt-4 max-w-xs text-lg leading-snug text-ink/85 break-words">
            {card.frase}
          </p>
        )}

        {links.length > 0 && (
          <ul className="mt-6 space-y-2.5">
            {links.map(({ rede, url: href }) => (
              <li key={rede}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between gap-3 rounded-2xl px-5 py-4 text-left transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cobalt ${REDES[rede]}`}
                >
                  <span className="font-bold">{nomeRede(rede)}</span>
                  <span className="min-w-0 truncate text-sm opacity-85">
                    {usuarioDoLink(rede, href)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 rounded-3xl bg-mist p-5">
          <div
            className="mx-auto w-44 rounded-xl bg-white p-3 [&>svg]:h-auto [&>svg]:w-full"
            role="img"
            aria-label={`QR code para ${url}`}
            dangerouslySetInnerHTML={{ __html: qr }}
          />
          <p className="mt-3 text-sm text-ink/60">Aponte a câmera para abrir este cartão</p>
        </div>
      </article>

      <div className="mt-5 space-y-3">
        <Compartilhar url={url} titulo={card.nome} />
        <p className="text-center text-sm text-white/75">
          <Link href="/" className="font-semibold underline underline-offset-4 hover:text-white">
            Crie o seu cartão
          </Link>
        </p>
      </div>
    </div>
  );
}
