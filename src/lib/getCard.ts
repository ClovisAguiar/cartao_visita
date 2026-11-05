import { CAMPOS_PUBLICOS, type Card } from "@/lib/cards";
import { supabase } from "@/lib/supabase";

export async function getCard(slug: string): Promise<Card | null> {
  const { data, error } = await supabase
    .from("cards")
    .select(CAMPOS_PUBLICOS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error("Não foi possível carregar o cartão.");
  return data as Card | null;
}
