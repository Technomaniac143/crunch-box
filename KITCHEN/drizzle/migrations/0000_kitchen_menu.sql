create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.kitchen_account_exists()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where role = 'admin')
$$;
grant execute on function public.kitchen_account_exists() to anon, authenticated;

-- First account ever created becomes the kitchen account. Later sign-ups get no edit rights.
create or replace function public.grant_first_kitchen_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created_kitchen
after insert on auth.users for each row execute function public.grant_first_kitchen_admin();

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Other',
  description text,
  image_url text,
  is_available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.menu_item_variants (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.menu_items(id) on delete cascade,
  name text not null,
  price int not null check (price >= 0),
  sort_order int not null default 0
);
create index on public.menu_item_variants(item_id);

grant select on public.menu_items, public.menu_item_variants to anon;
grant select, insert, update, delete on public.menu_items, public.menu_item_variants to authenticated;
grant all on public.menu_items, public.menu_item_variants to service_role;
alter table public.menu_items enable row level security;
alter table public.menu_item_variants enable row level security;

create policy "Anyone can read menu" on public.menu_items for select to anon, authenticated using (true);
create policy "Kitchen manages menu" on public.menu_items for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Anyone can read variants" on public.menu_item_variants for select to anon, authenticated using (true);
create policy "Kitchen manages variants" on public.menu_item_variants for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
create trigger menu_items_touch before update on public.menu_items for each row execute function public.touch_updated_at();

-- Seed current menu
with i as (
  insert into public.menu_items (name, category, sort_order) values
  ('French Fries','French Fries',1),
  ('Loaded Fries','Loaded Fries',2),
  ('Chicken Loaded Fries','Loaded Fries',3),
  ('Beef Loaded Fries','Loaded Fries',4),
  ('Popcorn Chicken','Chicken',5),
  ('Lays Chicken','Chicken',6),
  ('Lollipop','Chicken',7),
  ('Chicken Strips','Chicken',8),
  ('Rice Bowl','Rice Bowls',9),
  ('Ultimate Savings Box','Combos',10),
  ('Saving Combo','Combos',11),
  ('Combo 1','Combos',12),
  ('Combo 2','Combos',13),
  ('Combo 3','Combos',14)
  returning id, name
)
insert into public.menu_item_variants (item_id, name, price, sort_order)
select i.id, v.vname, v.price, v.ord from i join (values
  ('French Fries','Regular',59,1),('French Fries','Medium',89,2),('French Fries','Large',119,3),
  ('Loaded Fries','Single Layer Medium',129,1),('Loaded Fries','Single Layer Large',189,2),('Loaded Fries','Double Layer Medium',199,3),('Loaded Fries','Double Layer Large',249,4),
  ('Chicken Loaded Fries','Single Layer Medium',129,1),('Chicken Loaded Fries','Single Layer Large',189,2),('Chicken Loaded Fries','Double Layer Medium',199,3),('Chicken Loaded Fries','Double Layer Large',249,4),
  ('Beef Loaded Fries','Single Layer Medium',159,1),('Beef Loaded Fries','Single Layer Large',199,2),
  ('Popcorn Chicken','Small',59,1),('Popcorn Chicken','Regular',99,2),('Popcorn Chicken','Medium',149,3),('Popcorn Chicken','Large',199,4),
  ('Lays Chicken','Medium',69,1),('Lays Chicken','Large',89,2),
  ('Lollipop','3 Piece',149,1),('Lollipop','5 Piece',229,2),
  ('Chicken Strips','5 Piece',139,1),('Chicken Strips','8 Piece',199,2),('Chicken Strips','13 Piece',299,3),
  ('Rice Bowl','Chicken Medium',149,1),('Rice Bowl','Chicken Large',249,2),('Rice Bowl','Leg Piece',159,3),('Rice Bowl','Leg + Popcorn Chicken',269,4),('Rice Bowl','Chicken Medium + Pepsi',169,5),('Rice Bowl','Chicken Medium + Fries + Pepsi',229,6),
  ('Ultimate Savings Box','Standard',829,1),
  ('Saving Combo','Standard',499,1),
  ('Combo 1','Standard',269,1),
  ('Combo 2','Standard',389,1),
  ('Combo 3','Standard',259,1)
) as v(iname, vname, price, ord) on v.iname = i.name;