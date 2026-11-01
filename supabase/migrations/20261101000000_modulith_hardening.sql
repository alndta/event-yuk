-- Hardening for the modular-monolith backend. Idempotent: safe to run more than once.

-- 1. OTP brute-force protection
alter table public.otp_codes add column if not exists attempts integer not null default 0;

create or replace function public.otp_increment_attempts(p_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.otp_codes set attempts = attempts + 1 where id = p_id;
$$;

-- 2. One role per account
create unique index if not exists user_profiles_roles_user_id_key on public.user_profiles_roles (user_id);

-- 3. Atomic, idempotent escrow hold: INITIATED -> ESCROW_HELD and lock the payer's funds together.
create or replace function public.hold_escrow(p_tx_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_payer uuid; v_gross numeric;
begin
  update public.escrow_transactions
     set status = 'ESCROW_HELD'
   where id = p_tx_id and status = 'INITIATED'
   returning payer_id, gross_amount into v_payer, v_gross;
  if not found then return false; end if;
  update public.wallets set escrow_locked = coalesce(escrow_locked, 0) + v_gross where user_id = v_payer;
  return true;
end $$;

-- 4. Only the backend (service role) may call the functions above.
revoke all on function public.otp_increment_attempts(uuid) from public, anon, authenticated;
revoke all on function public.hold_escrow(uuid) from public, anon, authenticated;

-- 5. Row level security: the backend uses the service role, so browsers get no direct table access.
do $$
declare t text;
begin
  foreach t in array array[
    'users','user_profiles_roles','otp_codes','events','tenant_booths','tenant_registrations',
    'crew_shifts','crew_applications','event_proposals','escrow_transactions','wallets',
    'vendor_packages','talent_profiles'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
    end if;
  end loop;
end $$;
