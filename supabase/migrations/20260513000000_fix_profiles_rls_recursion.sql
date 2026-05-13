-- Fix recursive RLS policies on public.profiles.
--
-- The admin checks must not query public.profiles directly from a profiles
-- policy. PostgreSQL re-enters the same policy while evaluating that query and
-- raises 42P17: infinite recursion detected in policy for relation "profiles".

create or replace function public.is_admin(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

alter table public.profiles enable row level security;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
  loop
    execute format(
      'drop policy if exists %I on public.profiles',
      policy_record.policyname
    );
  end loop;
end;
$$;

create policy "profiles_select_self_or_admin"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
);

create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
);

create policy "profiles_update_admin"
on public.profiles
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "profiles_delete_admin"
on public.profiles
for delete
to authenticated
using (
  public.is_admin()
);
