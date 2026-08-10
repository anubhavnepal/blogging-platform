-- Comprehensive Supabase Database Schema for Multi-Author Blogging System

-- Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Tied to Supabase Auth Users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  username text unique,
  avatar_url text,
  role text check (role in ('admin', 'author', 'reader')) default 'reader',
  verification_status text check (verification_status in ('none', 'pending', 'approved', 'rejected')) default 'none',
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. SITE CONFIGURATION TABLE (Managed by Admin)
create table if not exists public.site_config (
  id integer primary key default 1 check (id = 1),
  site_name text not null default 'Chronicle',
  tagline text default 'Where ideas, code, and insights converge.',
  announcement_banner text default '✨ Welcome to Chronicle — A modern publication hub for developers and creators.',
  allow_anonymous_reading boolean default true,
  auto_approve_authors boolean default false,
  maintenance_mode boolean default false,
  featured_category text default 'All',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. POSTS TABLE
create table if not exists public.posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  cover_image text,
  category text not null default 'General',
  tags text[] default '{}',
  author_id uuid references public.profiles(id) on delete cascade not null,
  is_published boolean default false,
  is_featured boolean default false,
  read_time text default '4 min read',
  views_count integer default 0,
  likes_count integer default 0,
  status text check (status in ('draft', 'published', 'flagged', 'archived')) default 'published',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. COMMENTS TABLE
create table if not exists public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. CONTENT REPORTS TABLE (Anti-Ill Content)
create table if not exists public.content_reports (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  details text,
  status text check (status in ('pending', 'resolved', 'dismissed')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. BOOKMARKS TABLE
create table public.bookmarks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

-- 7. POST LIKES TABLE (Realtime Like Interaction)
create table public.post_likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

-- ==================== RLS POLICIES ====================

alter table public.profiles enable row level security;
alter table public.site_config enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.content_reports enable row level security;
alter table public.bookmarks enable row level security;
alter table public.post_likes enable row level security;

-- Profiles: Public read, self update
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can update any profile" on public.profiles for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Site Config: Public read, Admin write
create policy "Anyone can view site config" on public.site_config for select using (true);
create policy "Admins can update site config" on public.site_config for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Posts: Public view published, Verified authors can create/edit own, Admin manage all
create policy "Published posts are viewable by everyone" on public.posts 
  for select using (is_published = true or author_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Approved authors can insert posts" on public.posts 
  for insert with check (
    auth.uid() = author_id and exists (
      select 1 from public.profiles 
      where id = auth.uid() and (verification_status = 'approved' or role = 'admin')
    )
  );

create policy "Authors can update own posts" on public.posts 
  for update using (
    auth.uid() = author_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Authors and Admins can delete posts" on public.posts 
  for delete using (
    auth.uid() = author_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Comments: Public view, logged-in user create
create policy "Comments viewable by everyone" on public.comments for select using (true);
create policy "Authenticated users can insert comments" on public.comments for insert with check (auth.uid() = author_id);
create policy "Users can delete own comments" on public.comments for delete using (
  auth.uid() = author_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Bookmarks: Users manage their own bookmarks
drop policy if exists "Users can view own bookmarks" on public.bookmarks;
drop policy if exists "Users can create own bookmarks" on public.bookmarks;
drop policy if exists "Users can delete own bookmarks" on public.bookmarks;

create policy "Users can view own bookmarks" on public.bookmarks for select using (auth.uid() = user_id);
create policy "Users can create own bookmarks" on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "Users can delete own bookmarks" on public.bookmarks for delete using (auth.uid() = user_id);

-- Post Likes: Public view, Users manage their own likes
create policy "Likes viewable by everyone" on public.post_likes for select using (true);
create policy "Users can like posts" on public.post_likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike posts" on public.post_likes for delete using (auth.uid() = user_id);

-- Reports: Logged in users can report, Admins can view/update
create policy "Users can submit reports" on public.content_reports for insert with check (auth.uid() is not null);
create policy "Admins can view reports" on public.content_reports for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update reports" on public.content_reports for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ==================== AUTOMATIC GOOGLE PROFILE CREATION TRIGGER ====================

create or replace function public.handle_new_user()
returns trigger 
security definer set search_path = public
language plpgsql
as $$
begin
  insert into public.profiles (id, email, full_name, username, avatar_url, role, verification_status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Subscriber'),
    coalesce(new.raw_user_meta_data->>'preferred_username', split_part(new.email, '@', 1), concat('user_', substring(new.id::text from 1 for 6))),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
    case when new.email = 'abannepal14@gmail.com' then 'admin'::public.user_role else 'reader'::public.user_role end,
    case when new.email = 'abannepal14@gmail.com' then 'approved'::public.verification_status else 'none'::public.verification_status end
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$;

-- Trigger execution after auth.users signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grant privileges to authenticated and anon roles
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role;
grant all on all functions in schema public to postgres, anon, authenticated, service_role;

-- Seed initial site config row
insert into public.site_config (id, site_name, tagline) 
values (1, 'Chronicle', 'Where ideas, code, and insights converge.')
on conflict (id) do nothing;

-- ==================== SUPABASE REALTIME ENABLEMENT ====================
-- Enable Realtime broadcasting for posts, likes, comments, profiles, and bookmarks
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.post_likes;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.bookmarks;
alter publication supabase_realtime add table public.profiles;


