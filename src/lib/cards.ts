export type Card = {
  slug: string;
  nome: string;
  cargo: string | null;
  cidade: string | null;
  frase: string | null;
  foto_path: string | null;
  linkedin: string | null;
  github: string | null;
  instagram: string | null;
  whatsapp: string | null;
};

export const CAMPOS_PUBLICOS =
  "slug, nome, cargo, cidade, frase, foto_path, linkedin, github, instagram, whatsapp";

export const LIMITES = { nome: 80, cargo: 80, cidade: 80, frase: 160 };

export const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30)
    .replace(/-+$/g, "");
}

type Rede = "linkedin" | "github" | "instagram" | "whatsapp";

const DOMINIOS: Record<Exclude<Rede, "whatsapp">, string[]> = {
  linkedin: ["linkedin.com"],
  github: ["github.com"],
  instagram: ["instagram.com"],
};

function hostConfere(url: URL, dominios: string[]) {
  return dominios.some((d) => url.hostname === d || url.hostname.endsWith("." + d));
}

/**
 * Transforma o que a pessoa digitou (usuário, @usuário, endereço ou telefone)
 * num link https. Devolve null se vazio e lança erro se não der para entender.
 */
export function normalizarLink(rede: Rede, valor: string): string | null {
  const v = valor.trim();
  if (!v) return null;

  if (rede === "whatsapp") {
    if (/^https:\/\/wa\.me\/\d{10,15}$/.test(v)) return v;
    let digitos = v.replace(/\D/g, "");
    if (digitos.length === 10 || digitos.length === 11) digitos = "55" + digitos;
    if (digitos.length < 12 || digitos.length > 15) {
      throw new Error("WhatsApp: use DDD e número, por exemplo (69) 99999-9999.");
    }
    return `https://wa.me/${digitos}`;
  }

  const pareceUrl = /^(https?:\/\/)?([a-z0-9-]+\.)*[a-z0-9-]+\.[a-z]{2,}(\/|$)/i.test(v);
  if (pareceUrl) {
    let url: URL;
    try {
      url = new URL(/^https?:\/\//i.test(v) ? v : "https://" + v);
    } catch {
      throw new Error(`${nomeRede(rede)}: endereço inválido.`);
    }
    if (!hostConfere(url, DOMINIOS[rede])) {
      throw new Error(`${nomeRede(rede)}: use um endereço do ${DOMINIOS[rede][0]}.`);
    }
    url.protocol = "https:";
    return url.toString().slice(0, 300);
  }

  const usuario = v.replace(/^@/, "");
  if (!/^[A-Za-z0-9._-]{1,100}$/.test(usuario)) {
    throw new Error(`${nomeRede(rede)}: usuário inválido.`);
  }
  if (rede === "linkedin") return `https://www.linkedin.com/in/${usuario}`;
  if (rede === "github") return `https://github.com/${usuario}`;
  return `https://www.instagram.com/${usuario}`;
}

export function nomeRede(rede: Rede): string {
  return { linkedin: "LinkedIn", github: "GitHub", instagram: "Instagram", whatsapp: "WhatsApp" }[
    rede
  ];
}

/** Versão de slugify que deixa o hífen no fim, para não atrapalhar quem está digitando. */
export function limparSlugDigitado(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, 30);
}
