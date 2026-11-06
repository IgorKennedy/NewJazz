-- Rode este arquivo inteiro no Supabase: SQL Editor > New query > Run

create table settings (
  id int primary key default 1 check (id = 1),
  hero_title text default 'Jazz ao vivo. Para momentos que ficam.',
  hero_sub text default 'Quarteto instrumental para casamentos, empresas e restaurantes.',
  whatsapp text default '5511973260429',
  email text default 'newjazz.contato@gmail.com',
  instagram text default 'newjazz.oficial',
  hero_images text[] default '{}',
  pdf_url text, pixel_id text, ga_id text
);
insert into settings (id) values (1);

create table leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null, whatsapp text not null, email text,
  format text, option text, event_date date, city text, notes text,
  consent boolean not null default false,
  status text not null default 'Novo', origin text not null default 'Site'
);
create table shows (
  id uuid primary key default gen_random_uuid(),
  show_date date not null, title text not null, city text,
  is_public boolean not null default true
);
create table videos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  title text, url text not null, kind text not null default 'youtube'
);

alter table settings enable row level security;
alter table leads enable row level security;
alter table shows enable row level security;
alter table videos enable row level security;

-- visitantes: só leem o que é público e só ENVIAM leads (nunca leem)
create policy "settings leitura" on settings for select using (true);
create policy "shows publicos" on shows for select using (is_public = true);
create policy "videos leitura" on videos for select using (true);
create policy "lead envio" on leads for insert to anon, authenticated with check (consent = true);

-- administrador (usuário logado): acesso total
create policy "admin settings" on settings for all to authenticated using (true) with check (true);
create policy "admin leads" on leads for all to authenticated using (true) with check (true);
create policy "admin shows" on shows for all to authenticated using (true) with check (true);
create policy "admin videos" on videos for all to authenticated using (true) with check (true);

-- armazenamento de fotos, vídeos e PDF do repertório
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict do nothing;
create policy "media leitura" on storage.objects for select using (bucket_id = 'media');
create policy "media admin" on storage.objects for all to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');
