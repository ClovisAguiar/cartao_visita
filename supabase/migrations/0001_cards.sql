-- Tabela dos cartões
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$'),
  nome text not null check (char_length(nome) between 1 and 80),
  cargo text check (char_length(cargo) <= 80),
  cidade text check (char_length(cidade) <= 80),
  frase text check (char_length(frase) <= 160),
  foto_path text check (foto_path ~ '^[A-Za-z0-9/_.-]{1,200}$'),
  linkedin text check (linkedin ~ '^https://' and char_length(linkedin) <= 300),
  github text check (github ~ '^https://' and char_length(github) <= 300),
  instagram text check (instagram ~ '^https://' and char_length(instagram) <= 300),
  whatsapp text check (whatsapp ~ '^https://' and char_length(whatsapp) <= 300),
  edit_token_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: qualquer um pode ler os cartões; ninguém grava direto na tabela
alter table public.cards enable row level security;

create policy "cards_leitura_publica" on public.cards
  for select to anon, authenticated using (true);

-- O hash do token nunca é lido pelo navegador
revoke all on public.cards from anon, authenticated;
grant select (id, slug, nome, cargo, cidade, frase, foto_path,
  linkedin, github, instagram, whatsapp, created_at, updated_at)
  on public.cards to anon, authenticated;

-- Cria o cartão e devolve o token secreto de edição (só o hash fica salvo)
create function public.create_card(
  p_slug text, p_nome text, p_cargo text, p_cidade text, p_frase text,
  p_foto_path text, p_linkedin text, p_github text, p_instagram text, p_whatsapp text
) returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_token text := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
begin
  insert into public.cards (slug, nome, cargo, cidade, frase, foto_path,
    linkedin, github, instagram, whatsapp, edit_token_hash)
  values (p_slug, p_nome, p_cargo, p_cidade, p_frase, p_foto_path,
    p_linkedin, p_github, p_instagram, p_whatsapp,
    encode(sha256(convert_to(v_token, 'UTF8')), 'hex'));
  return v_token;
end;
$$;

-- Confere se o token vale para o apelido
create function public.check_edit_token(p_slug text, p_token text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.cards
    where slug = p_slug
      and edit_token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex')
  );
$$;

-- Atualiza o cartão só se o token estiver certo
create function public.update_card(
  p_slug text, p_token text, p_nome text, p_cargo text, p_cidade text, p_frase text,
  p_foto_path text, p_linkedin text, p_github text, p_instagram text, p_whatsapp text
) returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  update public.cards set
    nome = p_nome, cargo = p_cargo, cidade = p_cidade, frase = p_frase,
    foto_path = p_foto_path, linkedin = p_linkedin, github = p_github,
    instagram = p_instagram, whatsapp = p_whatsapp, updated_at = now()
  where slug = p_slug
    and edit_token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex');
  return found;
end;
$$;

revoke all on function public.create_card(text, text, text, text, text, text, text, text, text, text) from public;
revoke all on function public.check_edit_token(text, text) from public;
revoke all on function public.update_card(text, text, text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.create_card(text, text, text, text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.check_edit_token(text, text) to anon, authenticated;
grant execute on function public.update_card(text, text, text, text, text, text, text, text, text, text, text) to anon, authenticated;

-- Bucket público das fotos: até 2 MB, só imagens
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

-- Qualquer um pode enviar foto nova; ninguém sobrescreve nem apaga
create policy "fotos_envio_publico" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'fotos');
