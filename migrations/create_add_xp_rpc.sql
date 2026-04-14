-- RPC segura para sumar XP
-- Recomendado ejecutar en Supabase SQL Editor

drop function if exists public.add_xp(uuid, int);

create or replace function public.add_xp(target_user_id uuid, amount int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid;
begin
  caller := auth.uid();

  if caller is null then
    raise exception 'Not authenticated';
  end if;

  if caller <> target_user_id then
    raise exception 'Forbidden';
  end if;

  if amount is null or amount <= 0 then
    raise exception 'Amount must be positive';
  end if;

  if amount > 500 then
    raise exception 'Amount too large';
  end if;

  update public.profiles
  set xp = coalesce(xp, 0) + amount
  where id = target_user_id;
end;
$$;

revoke all on function public.add_xp(uuid, int) from public;
grant execute on function public.add_xp(uuid, int) to authenticated;
