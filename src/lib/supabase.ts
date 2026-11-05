import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Faltam NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY nas variáveis de ambiente.",
  );
}

// Chave pública (anon/publishable). Pode ir para o navegador.
export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

export const BUCKET_FOTOS = "fotos";

export function fotoUrl(path: string | null): string | null {
  if (!path) return null;
  return supabase.storage.from(BUCKET_FOTOS).getPublicUrl(path).data.publicUrl;
}
