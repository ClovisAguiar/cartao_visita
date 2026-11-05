"use client";

import { BUCKET_FOTOS, supabase } from "@/lib/supabase";

const LADO_MAX = 800;

/** Reduz a foto para no máximo 800px e converte para JPEG, para caber no limite de 2 MB. */
async function reduzir(arquivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a foto.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Não foi possível processar a foto."))),
      "image/jpeg",
      0.85,
    ),
  );
}

export async function enviarFoto(arquivo: File, slug: string): Promise<string> {
  if (!arquivo.type.startsWith("image/")) throw new Error("A foto precisa ser uma imagem.");
  const blob = await reduzir(arquivo);
  const path = `${slug}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET_FOTOS)
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw new Error("Não foi possível enviar a foto. Tente outra imagem.");
  return path;
}
