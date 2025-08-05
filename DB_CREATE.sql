create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  bio text,
  avatar_url text,
  is_private boolean default false, 
  created_at timestamp with time zone default timezone('utc', now())
);
-----

create table dreams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null check (length(title) <= 100),
  content text not null check (length(content) <= 2000),
  dream_date date not null default current_date,
  is_private boolean default false,
  created_at timestamp with time zone default timezone('utc', now())
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  dream_id uuid references dreams(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

create table follows (
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()),
  primary key (follower_id, following_id)
);

create table follow_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references profiles(id) on delete cascade,
  receiver_id uuid references profiles(id) on delete cascade,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc', now()),
  unique (sender_id, receiver_id)
);
