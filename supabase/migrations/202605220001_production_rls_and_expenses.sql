-- Production safety migration for Laundry King.
-- Apply after taking a Supabase backup. This migration is additive/idempotent:
-- it creates missing expenses support, enables RLS, and adds managed policies
-- without deleting table data or unknown existing policies.

begin;

create extension if not exists pgcrypto;

create or replace function public.current_user_is_admin()
returns boolean
language sql
security definer
set search_path = public
set row_security = off
stable
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.current_user_is_admin() to authenticated;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if to_regclass('public.users') is not null then
    insert into public.users (id, full_name, email, username, role)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      lower(coalesce(new.email, '')),
      split_part(lower(coalesce(new.email, '')), '@', 1),
      coalesce(new.raw_user_meta_data->>'role', 'customer')
    )
    on conflict (id) do update
      set email = excluded.email,
          full_name = coalesce(nullif(public.users.full_name, ''), excluded.full_name),
          username = coalesce(nullif(public.users.username, ''), excluded.username);
  end if;

  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'lk_on_auth_user_created'
  ) then
    create trigger lk_on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_auth_user();
  end if;
end $$;

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid null,
  type text not null default 'Other Supplies',
  detail text not null,
  quantity numeric not null default 0,
  unit text null,
  action text null check (action is null or action in ('purchase', 'usage', 'adjustment')),
  remark text null,
  total_amount numeric not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.expenses
  add column if not exists inventory_id uuid null,
  add column if not exists type text not null default 'Other Supplies',
  add column if not exists detail text,
  add column if not exists quantity numeric not null default 0,
  add column if not exists unit text null,
  add column if not exists action text null,
  add column if not exists remark text null,
  add column if not exists total_amount numeric not null default 0,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'inventory'
  ) and not exists (
    select 1 from pg_constraint where conname = 'expenses_inventory_id_fkey'
  ) then
    alter table public.expenses
      add constraint expenses_inventory_id_fkey
      foreign key (inventory_id)
      references public.inventory(id)
      on update cascade
      on delete set null;
  end if;
end $$;

create index if not exists expenses_created_at_idx on public.expenses (created_at desc);
create index if not exists expenses_inventory_id_idx on public.expenses (inventory_id);

alter table if exists public.users enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.inventory enable row level security;
alter table if exists public.transactions enable row level security;
alter table public.expenses enable row level security;

do $$
begin
  if to_regclass('public.users') is not null then
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'users' and policyname = 'lk_users_authenticated_select_permissive') then
      create policy lk_users_authenticated_select_permissive on public.users
        for select to authenticated
        using (true);
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'users' and policyname = 'lk_users_self_or_admin_select_restrictive') then
      create policy lk_users_self_or_admin_select_restrictive on public.users
        as restrictive for select to authenticated
        using (id = auth.uid() or public.current_user_is_admin());
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'users' and policyname = 'lk_users_self_insert_permissive') then
      create policy lk_users_self_insert_permissive on public.users
        for insert to authenticated
        with check (id = auth.uid());
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'users' and policyname = 'lk_users_authenticated_update_permissive') then
      create policy lk_users_authenticated_update_permissive on public.users
        for update to authenticated
        using (true)
        with check (true);
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'users' and policyname = 'lk_users_self_or_admin_update_restrictive') then
      create policy lk_users_self_or_admin_update_restrictive on public.users
        as restrictive for update to authenticated
        using (id = auth.uid() or public.current_user_is_admin())
        with check (id = auth.uid() or public.current_user_is_admin());
    end if;
  end if;

  if to_regclass('public.orders') is not null then
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'lk_orders_authenticated_select_permissive') then
      create policy lk_orders_authenticated_select_permissive on public.orders
        for select to authenticated
        using (true);
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'lk_orders_owner_or_admin_select_restrictive') then
      create policy lk_orders_owner_or_admin_select_restrictive on public.orders
        as restrictive for select to authenticated
        using (user_id = auth.uid() or public.current_user_is_admin());
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'lk_orders_authenticated_insert_permissive') then
      create policy lk_orders_authenticated_insert_permissive on public.orders
        for insert to authenticated
        with check (true);
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'lk_orders_owner_insert_restrictive') then
      create policy lk_orders_owner_insert_restrictive on public.orders
        as restrictive for insert to authenticated
        with check (user_id = auth.uid() or public.current_user_is_admin());
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'lk_orders_authenticated_update_permissive') then
      create policy lk_orders_authenticated_update_permissive on public.orders
        for update to authenticated
        using (true)
        with check (true);
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'lk_orders_admin_manage_restrictive') then
      create policy lk_orders_admin_manage_restrictive on public.orders
        as restrictive for update to authenticated
        using (public.current_user_is_admin())
        with check (public.current_user_is_admin());
    end if;
  end if;

  if to_regclass('public.inventory') is not null then
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'inventory' and policyname = 'lk_inventory_authenticated_permissive') then
      create policy lk_inventory_authenticated_permissive on public.inventory
        for all to authenticated
        using (true)
        with check (true);
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'inventory' and policyname = 'lk_inventory_admin_only_restrictive') then
      create policy lk_inventory_admin_only_restrictive on public.inventory
        as restrictive for all to authenticated
        using (public.current_user_is_admin())
        with check (public.current_user_is_admin());
    end if;
  end if;

  if to_regclass('public.transactions') is not null then
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'transactions' and policyname = 'lk_transactions_authenticated_select_permissive') then
      create policy lk_transactions_authenticated_select_permissive on public.transactions
        for select to authenticated
        using (true);
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'transactions' and policyname = 'lk_transactions_owner_or_admin_select_restrictive') then
      create policy lk_transactions_owner_or_admin_select_restrictive on public.transactions
        as restrictive for select to authenticated
        using (user_id = auth.uid() or public.current_user_is_admin());
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'transactions' and policyname = 'lk_transactions_authenticated_insert_permissive') then
      create policy lk_transactions_authenticated_insert_permissive on public.transactions
        for insert to authenticated
        with check (true);
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'transactions' and policyname = 'lk_transactions_owner_insert_restrictive') then
      create policy lk_transactions_owner_insert_restrictive on public.transactions
        as restrictive for insert to authenticated
        with check (user_id = auth.uid() or public.current_user_is_admin());
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'transactions' and policyname = 'lk_transactions_authenticated_update_permissive') then
      create policy lk_transactions_authenticated_update_permissive on public.transactions
        for update to authenticated
        using (true)
        with check (true);
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'transactions' and policyname = 'lk_transactions_admin_manage_restrictive') then
      create policy lk_transactions_admin_manage_restrictive on public.transactions
        as restrictive for update to authenticated
        using (public.current_user_is_admin())
        with check (public.current_user_is_admin());
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'transactions' and policyname = 'lk_transactions_admin_delete_permissive') then
      create policy lk_transactions_admin_delete_permissive on public.transactions
        for delete to authenticated
        using (public.current_user_is_admin());
    end if;
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'expenses' and policyname = 'lk_expenses_authenticated_permissive') then
    create policy lk_expenses_authenticated_permissive on public.expenses
      for all to authenticated
      using (true)
      with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'expenses' and policyname = 'lk_expenses_admin_only_restrictive') then
    create policy lk_expenses_admin_only_restrictive on public.expenses
      as restrictive for all to authenticated
      using (public.current_user_is_admin())
      with check (public.current_user_is_admin());
  end if;
end $$;

commit;

-- Rollback notes:
-- 1. This migration does not delete data. To roll back access behavior, drop only
--    policies prefixed with lk_, trigger lk_on_auth_user_created, and functions
--    public.current_user_is_admin() / public.handle_new_auth_user().
-- 2. Keep public.expenses unless you have backed up/exported its rows.
