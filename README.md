# New Jazz — Site + Painel (Next.js + Supabase + Vercel)

## O que tem aqui
- **Site público** (`/`): banner com 3 imagens, formatos, agenda, vídeos, Instagram, repertório em PDF, perguntas frequentes e formulário que salva o lead e abre o WhatsApp. SEO completo (metadados, dados estruturados, sitemap, robots, redirecionamentos).
- **Painel** (`/admin`): login, dashboard, leads (com CSV para remarketing), calculadora com PDF, agenda, vídeos (YouTube ou arquivo) e edição do site (textos, 3 imagens do banner, PDF do repertório, WhatsApp, Instagram, Pixel e Analytics).

## Passo 1 — Supabase (banco e login)
1. Crie um projeto em supabase.com.
2. **SQL Editor > New query**: cole todo o conteúdo de `supabase/schema.sql` e clique em **Run**.
3. **Authentication > Users > Add user**: crie o seu e-mail e senha (marque "Auto Confirm User").
4. **Authentication > Sign In / Providers**: **desative "Allow new users to sign up"**. Isso é essencial: qualquer usuário logado tem acesso total ao painel.
5. **Project Settings > API**: copie a **Project URL** e a chave **anon public**.

## Passo 2 — GitHub
Crie um repositório vazio e envie esta pasta (não envie `.env.local`).

## Passo 3 — Vercel
1. Vercel > **Add New > Project** > importe o repositório.
2. Em **Environment Variables**, adicione: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `NEXT_PUBLIC_SITE_URL` (`https://www.newjazzoficial.com.br`).
3. **Deploy**. Acesse `seu-projeto.vercel.app/admin` e entre.

## Passo 4 — Trocar o domínio (sem perder o Google)
1. Vercel > Project > **Settings > Domains**: adicione `www.newjazzoficial.com.br` e `newjazzoficial.com.br`.
2. No registro do domínio, aponte conforme a Vercel indicar (CNAME `cname.vercel-dns.com` para o `www`).
3. Antes da troca, confira as URLs antigas do Google Sites e ajuste os redirecionamentos 301 em `next.config.mjs`.
4. Depois: cadastre o site no **Google Search Console**, envie `https://www.newjazzoficial.com.br/sitemap.xml` e crie/atualize o **Perfil da Empresa no Google**.

## Rodar no computador (opcional)
```
cp .env.example .env.local   # preencha os valores
npm install
npm run dev
```

## Observações
- Agenda, vídeos e textos aparecem no site em até 1 minuto (cache).
- Instagram: o site mostra o bloco com link para o perfil. Exibir os vídeos postados automaticamente exige a API oficial do Instagram (conta profissional vinculada a uma página do Facebook) ou um serviço de widget; fica como próxima etapa.
- A Política de Privacidade é um texto-modelo: peça revisão jurídica.
- Arquivos de vídeo: limite de 50 MB por arquivo no plano gratuito do Supabase.
