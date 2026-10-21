-- У Supabase SQL Editor виконай цей файл ПІСЛЯ створення облікового запису.
-- Замінити 5256bcd1-1ece-4bac-86f5-4d19d6c53a06 на UUID твого користувача з Authentication → Users.
create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 80),
  category text not null check (category in ('portrait','illustration','character')),
  description text not null,
  image_url text not null,
  created_at timestamptz not null default now()
);
alter table public.works enable row level security;
grant select on public.works to anon, authenticated;
grant insert, delete on public.works to authenticated;
drop policy if exists "Anyone can view works" on public.works;
create policy "Anyone can view works" on public.works for select using (true);
drop policy if exists "Admin can add works" on public.works;
create policy "Admin can add works" on public.works for insert to authenticated with check (auth.uid() = '5256bcd1-1ece-4bac-86f5-4d19d6c53a06'::uuid);
drop policy if exists "Admin can delete works" on public.works;
create policy "Admin can delete works" on public.works for delete to authenticated using (auth.uid() = '5256bcd1-1ece-4bac-86f5-4d19d6c53a06'::uuid);
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('portfolio','portfolio',true,8388608,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=true,file_size_limit=8388608,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Public can view portfolio images" on storage.objects;
create policy "Public can view portfolio images" on storage.objects for select using (bucket_id='portfolio');
drop policy if exists "Admin can upload portfolio images" on storage.objects;
create policy "Admin can upload portfolio images" on storage.objects for insert to authenticated with check (bucket_id='portfolio' and auth.uid() = '5256bcd1-1ece-4bac-86f5-4d19d6c53a06'::uuid);
drop policy if exists "Admin can delete portfolio images" on storage.objects;
create policy "Admin can delete portfolio images" on storage.objects for delete to authenticated using (bucket_id='portfolio' and auth.uid() = '5256bcd1-1ece-4bac-86f5-4d19d6c53a06'::uuid);
