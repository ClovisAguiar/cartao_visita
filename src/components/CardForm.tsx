"use client";

import Link from "next/link";
import { useState } from "react";
import { type Card, LIMITES, SLUG_REGEX, limparSlugDigitado, normalizarLink, slugify } from "@/lib/cards";
import { enviarFoto } from "@/lib/foto";
import { fotoUrl, supabase } from "@/lib/supabase";
import { CopiarLink } from "@/components/CopiarLink";

type Props =
  | { modo: "criar" }
  | { modo: "editar"; card: Card; token: string };

type Resultado = { slug: string; linkEdicao?: string };

const campo =
  "mt-1.5 block w-full rounded-2xl border-2 border-ink/15 bg-paper px-4 py-3 text-base text-ink placeholder:text-ink/40 transition focus:border-cobalt focus:outline-none";
const rotulo = "block text-sm font-semibold text-ink";
const dica = "mt-1 text-xs text-ink/60";

export function CardForm(props: Props) {
  const inicial = props.modo === "editar" ? props.card : null;

  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [slugDigitado, setSlug] = useState(inicial?.slug ?? "");
  const [slugTocado, setSlugTocado] = useState(props.modo === "editar");
  const [cargo, setCargo] = useState(inicial?.cargo ?? "");
  const [cidade, setCidade] = useState(inicial?.cidade ?? "");
  const [frase, setFrase] = useState(inicial?.frase ?? "");
  const [linkedin, setLinkedin] = useState(inicial?.linkedin ?? "");
  const [github, setGithub] = useState(inicial?.github ?? "");
  const [instagram, setInstagram] = useState(inicial?.instagram ?? "");
  const [whatsapp, setWhatsapp] = useState(inicial?.whatsapp ?? "");
  const [foto, setFoto] = useState<File | null>(null);
  const [previa, setPrevia] = useState<string | null>(fotoUrl(inicial?.foto_path ?? null));

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  function aoMudarNome(valor: string) {
    setNome(valor);
    if (!slugTocado) setSlug(slugify(valor));
  }

  function aoEscolherFoto(arquivo: File | null) {
    setFoto(arquivo);
    if (previa?.startsWith("blob:")) URL.revokeObjectURL(previa);
    setPrevia(arquivo ? URL.createObjectURL(arquivo) : fotoUrl(inicial?.foto_path ?? null));
  }

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);

    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return setErro("Preencha seu nome.");
    const slug = slugDigitado.replace(/-+$/, "");
    if (!SLUG_REGEX.test(slug)) {
      return setErro(
        "O apelido precisa ter de 3 a 30 caracteres: letras minúsculas, números e hífen.",
      );
    }

    let links: Record<"linkedin" | "github" | "instagram" | "whatsapp", string | null>;
    try {
      links = {
        linkedin: normalizarLink("linkedin", linkedin),
        github: normalizarLink("github", github),
        instagram: normalizarLink("instagram", instagram),
        whatsapp: normalizarLink("whatsapp", whatsapp),
      };
    } catch (err) {
      return setErro((err as Error).message);
    }

    setEnviando(true);
    try {
      let fotoPath = inicial?.foto_path ?? null;
      if (foto) fotoPath = await enviarFoto(foto, slug);

      const dados = {
        p_nome: nomeLimpo,
        p_cargo: cargo.trim() || null,
        p_cidade: cidade.trim() || null,
        p_frase: frase.trim() || null,
        p_foto_path: fotoPath,
        p_linkedin: links.linkedin,
        p_github: links.github,
        p_instagram: links.instagram,
        p_whatsapp: links.whatsapp,
      };

      if (props.modo === "criar") {
        const { data, error } = await supabase.rpc("create_card", { p_slug: slug, ...dados });
        if (error) {
          if (error.code === "23505") throw new Error("Esse apelido já está em uso. Escolha outro.");
          throw new Error("Não foi possível salvar. Confira os campos e tente de novo.");
        }
        const linkEdicao = `${window.location.origin}/editar/${slug}?k=${data as string}`;
        setResultado({ slug, linkEdicao });
      } else {
        const { data, error } = await supabase.rpc("update_card", {
          p_slug: slug,
          p_token: props.token,
          ...dados,
        });
        if (error) throw new Error("Não foi possível salvar. Confira os campos e tente de novo.");
        if (!data) throw new Error("Link de edição inválido.");
        setResultado({ slug });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  if (resultado) {
    const linkPublico =
      typeof window !== "undefined" ? `${window.location.origin}/c/${resultado.slug}` : "";
    return (
      <div className="rounded-[2rem] bg-paper p-6 shadow-xl shadow-cobalt/10 sm:p-8" role="status">
        <h2 className="font-display text-3xl font-bold tracking-tight">
          {props.modo === "criar" ? "Cartão criado!" : "Alterações salvas!"}
        </h2>
        <p className="mt-2 text-ink/70">
          {props.modo === "criar"
            ? "Compartilhe o link público. Guarde o link de edição: ele é a única forma de mudar seu cartão."
            : "Seu cartão já está atualizado."}
        </p>

        <div className="mt-6 space-y-5">
          <CopiarLink rotulo="Link público" url={linkPublico} />
          {resultado.linkEdicao && (
            <div className="rounded-2xl border-2 border-dashed border-signal bg-signal/15 p-4">
              <CopiarLink rotulo="Link secreto de edição" url={resultado.linkEdicao} />
              <p className="mt-2 text-sm text-ink/80">
                Não mostre este link para ninguém. Quem tiver ele pode alterar seu cartão, e não
                dá para recuperar se você perder.
              </p>
            </div>
          )}
        </div>

        <Link
          href={`/c/${resultado.slug}`}
          className="mt-8 flex w-full items-center justify-center rounded-full bg-cobalt px-6 py-4 text-lg font-bold text-white transition hover:bg-cobalt-deep focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
        >
          Ver meu cartão
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={salvar}
      noValidate
      className="space-y-8 rounded-[2rem] bg-paper p-6 shadow-xl shadow-cobalt/10 sm:p-8"
    >
      <fieldset className="space-y-5">
        <legend className="font-display text-xl font-bold">Sobre você</legend>

        <div className="flex items-center gap-4">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-full bg-mist ring-2 ring-ink/10">
            {previa ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previa} alt="Prévia da foto" className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center text-3xl font-bold text-ink/30">
                {nome.trim().charAt(0).toUpperCase() || "?"}
              </span>
            )}
          </div>
          <label className="cursor-pointer rounded-full border-2 border-ink px-4 py-2 text-sm font-semibold transition focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-cobalt hover:bg-ink hover:text-white">
            {previa ? "Trocar foto" : "Escolher foto"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => aoEscolherFoto(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <div>
          <label htmlFor="nome" className={rotulo}>
            Nome
          </label>
          <input
            id="nome"
            name="nome"
            required
            autoComplete="name"
            maxLength={LIMITES.nome}
            value={nome}
            onChange={(e) => aoMudarNome(e.target.value)}
            className={campo}
            placeholder="Maria Souza"
          />
        </div>

        <div>
          <label htmlFor="slug" className={rotulo}>
            Apelido do link
          </label>
          <div className="mt-1.5 flex items-center rounded-2xl border-2 border-ink/15 bg-mist transition focus-within:border-cobalt">
            <span className="pl-4 text-base text-ink/50">/c/</span>
            <input
              id="slug"
              name="slug"
              required
              disabled={props.modo === "editar"}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={30}
              value={slugDigitado}
              onChange={(e) => {
                setSlugTocado(true);
                setSlug(limparSlugDigitado(e.target.value));
              }}
              className="w-full min-w-0 rounded-r-2xl bg-transparent py-3 pr-4 pl-0.5 text-base focus:outline-none disabled:text-ink/60"
              placeholder="maria-souza"
              aria-describedby="slug-dica"
            />
          </div>
          <p id="slug-dica" className={dica}>
            {props.modo === "editar"
              ? "O apelido não pode ser trocado."
              : "Letras minúsculas, números e hífen. É o endereço do seu cartão."}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="cargo" className={rotulo}>
              Cargo
            </label>
            <input
              id="cargo"
              name="cargo"
              autoComplete="organization-title"
              maxLength={LIMITES.cargo}
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className={campo}
              placeholder="Desenvolvedora front-end"
            />
          </div>
          <div>
            <label htmlFor="cidade" className={rotulo}>
              Cidade
            </label>
            <input
              id="cidade"
              name="cidade"
              autoComplete="address-level2"
              maxLength={LIMITES.cidade}
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className={campo}
              placeholder="Porto Velho, RO"
            />
          </div>
        </div>

        <div>
          <label htmlFor="frase" className={rotulo}>
            Frase curta
          </label>
          <textarea
            id="frase"
            name="frase"
            rows={2}
            maxLength={LIMITES.frase}
            value={frase}
            onChange={(e) => setFrase(e.target.value)}
            className={`${campo} resize-none`}
            placeholder="Transformo ideias em produtos que as pessoas gostam de usar."
            aria-describedby="frase-dica"
          />
          <p id="frase-dica" className={dica}>
            {frase.length}/{LIMITES.frase}
          </p>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-display text-xl font-bold">Links</legend>
        <p className="-mt-3 text-sm text-ink/60">Todos opcionais. Pode colar o endereço ou só o usuário.</p>

        <div>
          <label htmlFor="linkedin" className={rotulo}>
            LinkedIn
          </label>
          <input
            id="linkedin"
            name="linkedin"
            autoCapitalize="none"
            spellCheck={false}
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            className={campo}
            placeholder="linkedin.com/in/mariasouza"
          />
        </div>
        <div>
          <label htmlFor="github" className={rotulo}>
            GitHub
          </label>
          <input
            id="github"
            name="github"
            autoCapitalize="none"
            spellCheck={false}
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            className={campo}
            placeholder="mariasouza"
          />
        </div>
        <div>
          <label htmlFor="instagram" className={rotulo}>
            Instagram
          </label>
          <input
            id="instagram"
            name="instagram"
            autoCapitalize="none"
            spellCheck={false}
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className={campo}
            placeholder="@mariasouza"
          />
        </div>
        <div>
          <label htmlFor="whatsapp" className={rotulo}>
            WhatsApp
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className={campo}
            placeholder="(69) 99999-9999"
          />
        </div>
      </fieldset>

      {erro && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-full bg-cobalt px-6 py-4 text-lg font-bold text-white transition hover:bg-cobalt-deep focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cobalt disabled:opacity-60"
      >
        {enviando ? "Salvando…" : props.modo === "criar" ? "Criar meu cartão" : "Salvar alterações"}
      </button>
    </form>
  );
}
