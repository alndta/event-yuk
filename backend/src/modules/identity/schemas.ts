import { z } from 'zod';
import { ROLES } from '../../shared/types';

const email = z.string().trim().toLowerCase().pipe(z.email('Format email belum benar.').max(255));
const password = z.string().min(8, 'Kata sandi minimal 8 karakter.').max(128, 'Kata sandi terlalu panjang.');
const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s-]{8,20}$/, 'Nomor telepon belum benar.');
const role = z.enum(ROLES);

export const bankAccountSchema = z.object({
  bank_code: z.string().trim().min(2).max(20),
  account_number: z.string().trim().regex(/^[0-9]{6,20}$/, 'Nomor rekening hanya angka (6 sampai 20 digit).'),
  account_holder: z.string().trim().min(2).max(120),
});

export const requestOtpSchema = z.object({ identifier: email.optional(), email: email.optional() }).refine((v) => v.identifier ?? v.email, {
  message: 'Email wajib diisi.',
  path: ['email'],
});

export const registerSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email,
  phone_wa: phone.optional(),
  password,
  initial_role: role.optional(),
  primary_role: role.optional(),
  otp_code: z.string().regex(/^\d{6}$/, 'Kode OTP terdiri dari 6 angka.'),
});

export const loginSchema = z.object({ email, password: z.string().min(1, 'Kata sandi wajib diisi.').max(128) });

export const googleSyncSchema = z.object({ access_token: z.string().min(20).max(4096) });

export const updateProfileSchema = z
  .object({
    full_name: z.string().trim().min(2).max(120),
    phone_wa: phone,
    business_name: z.string().trim().min(2).max(255),
    city_region: z.string().trim().min(2).max(100),
    bank_account: bankAccountSchema,
  })
  .partial();

export const submitKycSchema = z.object({
  nik: z.string().trim().regex(/^[0-9]{16}$/, 'NIK terdiri dari 16 angka.'),
  bank_account: bankAccountSchema,
});

export const setRoleSchema = z.object({
  role_type: role,
  business_name: z.string().trim().min(2).max(255).optional(),
  city_region: z.string().trim().min(2).max(100).optional(),
  phone_wa: phone.optional(),
});

export const adminKycSchema = z
  .object({ decision: z.enum(['VERIFIED', 'UNVERIFIED']), reason: z.string().trim().min(3).max(300).optional() })
  .refine((v) => v.decision === 'VERIFIED' || !!v.reason, { message: 'Alasan penolakan wajib diisi.', path: ['reason'] });
export const userIdParams = z.object({ id: z.uuid() });

export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SetRoleInput = z.infer<typeof setRoleSchema>;
