# Cartão de visita digital

## Equipe
- Clovis Aguiar (UniSAPIENS)

## Pedido
App de cartão de visita digital.

- Na página inicial, a pessoa preenche nome, cargo, cidade, uma frase curta, foto e links (LinkedIn, GitHub, Instagram, WhatsApp; todos opcionais).
- Ao salvar, ela ganha uma página pública em `/c/[apelido]`, bonita no celular, com botões para cada link e um QR code que aponta para essa página.
- A foto vai para um bucket público do Supabase Storage.
- Sem login: ao criar, o app gera um link secreto de edição e mostra para a pessoa guardar.
- Tabela `cards` no Supabase (SQL mostrado antes de aplicar).
- Em todas as páginas, botão fixo "Equipe" no canto inferior direito que abre um modal com os participantes no formato Nome (Faculdade). Lista em `src/equipe.ts`.
- Stack: Next.js (App Router) com TypeScript e Tailwind, Supabase e Vercel. `npm run build` antes de enviar. Chaves só em variáveis de ambiente.

## Decisões
- O token de edição nunca fica salvo em texto puro: o banco guarda só o hash SHA-256.
- O navegador não grava direto na tabela. Criar e editar passam por funções `create_card` e `update_card` no Postgres, que conferem o token.
- Links salvos sempre começam com `https://` (o banco recusa outros).
- Fotos: bucket público `fotos`, até 2 MB, só JPG, PNG ou WebP.

## Pronto quando
- [ ] A página inicial tem o formulário com nome, cargo, cidade, frase, foto e os quatro links opcionais.
- [ ] Salvar cria o cartão e mostra o link público e o link secreto de edição.
- [ ] `/c/[apelido]` abre no celular, mostra os dados, a foto, um botão por link preenchido e o QR code.
- [ ] O QR code abre a página do cartão.
- [ ] A foto fica no bucket público do Supabase Storage.
- [ ] O link secreto de edição permite alterar o cartão; sem o token não dá para alterar.
- [ ] O botão "Equipe" aparece em todas as páginas e abre o modal com Nome (Faculdade).
- [ ] `npm run build` passa e o deploy na Vercel funciona.
