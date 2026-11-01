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
     set escrow_state = 'ESCROW_HELD', updated_at = now()
   where id = p_tx_id and escrow_state = 'INITIATED'
   returning payer_id, gross_amount into v_payer, v_gross;
  if not found then return false; end if;
  insert into public.wallets (user_id, escrow_locked) values (v_payer, v_gross)
  on conflict (user_id) do update set escrow_locked = coalesce(public.wallets.escrow_locked, 0) + excluded.escrow_locked, updated_at = now();
  return true;
end $$;

-- 3b. Handover (BAST): the payee reports the work done, the payer approves, and only then is the money released.
alter table public.escrow_transactions add column if not exists bast_submitted_at timestamptz;
alter table public.escrow_transactions add column if not exists bast_note text;
alter table public.escrow_transactions add column if not exists bast_approved_at timestamptz;

create or replace function public.submit_bast(p_tx_id uuid, p_note text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  update public.escrow_transactions
     set bast_submitted_at = now(), bast_note = p_note, updated_at = now()
   where id = p_tx_id and escrow_state = 'ESCROW_HELD' and bast_submitted_at is null;
  return found;
end $$;

create or replace function public.release_escrow(p_tx_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_payer uuid; v_payee uuid; v_gross numeric; v_fee numeric;
begin
  update public.escrow_transactions
     set escrow_state = 'SETTLED', bast_approved_at = now(), updated_at = now()
   where id = p_tx_id and escrow_state = 'ESCROW_HELD' and bast_submitted_at is not null
   returning payer_id, payee_id, gross_amount, coalesce(platform_fee, 0) into v_payer, v_payee, v_gross, v_fee;
  if not found then return false; end if;
  update public.wallets set escrow_locked = greatest(coalesce(escrow_locked, 0) - v_gross, 0), updated_at = now() where user_id = v_payer;
  insert into public.wallets (user_id, available_bal) values (v_payee, v_gross - v_fee)
  on conflict (user_id) do update set available_bal = coalesce(public.wallets.available_bal, 0) + excluded.available_bal, updated_at = now();
  return true;
end $$;

-- 4. Only the backend (service role) may call the functions above.
revoke all on function public.otp_increment_attempts(uuid) from public, anon, authenticated;
revoke all on function public.hold_escrow(uuid) from public, anon, authenticated;
revoke all on function public.submit_bast(uuid, text) from public, anon, authenticated;
revoke all on function public.release_escrow(uuid) from public, anon, authenticated;

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

-- 6. e-KYC submissions (NIK stored only as a keyed hash)
create table if not exists public.kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  nik_hash text not null,
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  reject_reason text,
  reviewed_by uuid references public.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists kyc_one_pending_per_user on public.kyc_submissions (user_id) where status = 'PENDING';
create unique index if not exists kyc_nik_unique_active on public.kyc_submissions (nik_hash) where status in ('PENDING','APPROVED');
alter table public.kyc_submissions enable row level security;

-- 7. e-KYC photos: metadata table and a PRIVATE storage bucket (files are served only through short-lived signed links)
create table if not exists public.kyc_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  kind text not null check (kind in ('KTP','SELFIE')),
  path text not null,
  content_type text not null,
  size_bytes integer not null,
  created_at timestamptz not null default now()
);
create index if not exists kyc_documents_user_idx on public.kyc_documents (user_id, kind, created_at desc);
alter table public.kyc_documents enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kyc-documents', 'kyc-documents', false, 5242880, array['image/jpeg','image/png'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png'];
