import { Router, Request, Response } from 'express';
import { supabase } from '../../config/supabase';
import { requireRole, RoleType } from '../../middleware/rbac';
import { sendEmail } from '../../config/mailer';
import { cacheResponse, invalidateCache } from '../../middleware/cache';

const router = Router();

/**
 * POST /api/v1/auth/send-otp
 * Generates and sends a 6-digit OTP code to email/phone
 */
router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, error: 'Email atau Nomor WhatsApp wajib diisi.' });
    }

    // Generate random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    // Insert into public.otp_codes
    await supabase.from('otp_codes').insert({
      identifier,
      otp_code: otpCode,
      expires_at: expiresAt,
      is_used: false,
    });

    // If identifier is an email, send email
    if (identifier.includes('@')) {
      await sendEmail({
        to: identifier,
        subject: 'Kode Verifikasi OTP Pendaftaran Event Yuk',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px;">
            <h2 style="color: #1F4E6B; margin-bottom: 8px;">Verifikasi Akun Event Yuk</h2>
            <p style="color: #475569; font-size: 14px;">Gunakan kode OTP berikut untuk menyelesaikan proses pendaftaran akun Anda di ekosistem Event Yuk:</p>
            <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #E75B4E;">${otpCode}</span>
            </div>
            <p style="color: #64748b; font-size: 12px;">Kode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapa pun.</p>
          </div>
        `,
      });
    }

    return res.json({
      success: true,
      message: `Kode OTP berhasil dikirim ke ${identifier}`,
      otp_preview: otpCode, // convenient for testing
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/auth/verify-otp-register
 * Verifies OTP and registers a new multi-role user
 */
router.post('/verify-otp-register', async (req: Request, res: Response) => {
  try {
    const { full_name, email, phone_wa, password, primary_role, initial_role, otp_code } = req.body;

    if (!email || !otp_code || !full_name) {
      return res.status(400).json({
        success: false,
        error: 'Nama lengkap, email, dan kode OTP wajib diisi.',
      });
    }

    // Verify OTP code
    const { data: otpRecord, error: otpErr } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('identifier', email)
      .eq('otp_code', otp_code)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpErr || !otpRecord) {
      return res.status(400).json({
        success: false,
        error: 'Kode OTP tidak valid atau sudah kadaluarsa. Silakan minta kode baru.',
      });
    }

    // Mark OTP as used
    await supabase.from('otp_codes').update({ is_used: true }).eq('id', otpRecord.id);

    // Create user in public.users
    const { data: newUser, error: userCreateErr } = await supabase
      .from('users')
      .insert({
        full_name,
        email,
        phone_wa: phone_wa || null,
        password_hash: password ? `hash_${password}` : null,
        kyc_status: 'UNVERIFIED',
      })
      .select()
      .single();

    if (userCreateErr) {
      return res.status(500).json({ success: false, error: userCreateErr.message });
    }

    // Create primary profile role in user_profiles_roles
    const roleToSet: RoleType = primary_role || initial_role || 'EO';
    await supabase.from('user_profiles_roles').insert({
      user_id: newUser.id,
      role_type: roleToSet,
      business_name: full_name,
    });

    // Create wallet record in wallets table
    await supabase.from('wallets').insert({
      user_id: newUser.id,
      escrow_locked: 0,
      available_bal: 0,
      currency: 'IDR',
    });

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil! Akun Anda telah aktif.',
      user: newUser,
      activeRole: roleToSet,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/auth/login
 * Mock / direct auth returning active user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const targetEmail = email || 'eo@eventyuk.id';

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        user_profiles_roles (*),
        wallets (*)
      `)
      .eq('email', targetEmail)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ success: false, error: 'User tidak ditemukan.' });
    }

    const userRole = (user.user_profiles_roles && user.user_profiles_roles.length > 0)
      ? (user.user_profiles_roles[0].role_type as RoleType)
      : null;

    return res.json({
      success: true,
      message: 'Login berhasil.',
      user: {
        ...user,
        active_role: userRole,
        business_name: user.user_profiles_roles?.[0]?.business_name || user.full_name,
        city_region: user.user_profiles_roles?.[0]?.city_region || 'Jakarta',
      },
      has_role: !!userRole,
      activeRole: userRole,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/auth/google-sync
 * Syncs Google OAuth user and checks role status
 */
router.post('/google-sync', async (req: Request, res: Response) => {
  try {
    const { email, full_name, avatar_url } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email wajib diisi.' });
    }

    let { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        user_profiles_roles (*),
        wallets (*)
      `)
      .eq('email', email)
      .maybeSingle();

    if (!user) {
      // Create user without role
      const { data: newUser, error: createErr } = await supabase
        .from('users')
        .insert({
          full_name: full_name || email.split('@')[0],
          email,
          kyc_status: 'UNVERIFIED',
        })
        .select()
        .single();

      if (createErr) {
        return res.status(500).json({ success: false, error: createErr.message });
      }

      // Create wallet record
      await supabase.from('wallets').insert({
        user_id: newUser.id,
        escrow_locked: 0,
        available_bal: 0,
        currency: 'IDR',
      });

      user = {
        ...newUser,
        user_profiles_roles: [] as any,
        wallets: null as any,
      };
    }

    if (!user) {
      return res.status(500).json({ success: false, error: 'Gagal memproses data akun pengguna.' });
    }

    const userObj: any = user;
    const userRole = (userObj.user_profiles_roles && userObj.user_profiles_roles.length > 0)
      ? (userObj.user_profiles_roles[0].role_type as RoleType)
      : null;

    return res.json({
      success: true,
      user: {
        ...userObj,
        active_role: userRole,
        business_name: userObj.user_profiles_roles?.[0]?.business_name || userObj.full_name,
        city_region: userObj.user_profiles_roles?.[0]?.city_region || 'Jakarta',
      },
      has_role: !!userRole,
      activeRole: userRole,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/users/me
 * Fetches current user profile and roles
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || 'a0000000-0000-0000-0000-000000000001';

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        user_profiles_roles (*),
        wallets (*)
      `)
      .eq('id', userId)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ success: false, error: 'Profil pengguna tidak ditemukan.' });
    }

    return res.json({ success: true, user });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/v1/users/profile
 * Updates user profile, e-KYC status, and bank account
 */
router.patch('/profile', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || 'a0000000-0000-0000-0000-000000000001';
    const { full_name, phone_wa, kyc_status, bank_account, business_name, city_region } = req.body;

    const userUpdate: any = {};
    if (full_name) userUpdate.full_name = full_name;
    if (phone_wa) userUpdate.phone_wa = phone_wa;
    if (kyc_status) userUpdate.kyc_status = kyc_status;

    if (Object.keys(userUpdate).length > 0) {
      userUpdate.updated_at = new Date().toISOString();
      await supabase.from('users').update(userUpdate).eq('id', userId);
    }

    // Update active profile role
    const activeRole = (req.headers['x-user-role'] as RoleType) || 'EO';
    const profileUpdate: any = {};
    if (business_name) profileUpdate.business_name = business_name;
    if (city_region) profileUpdate.city_region = city_region;
    if (bank_account) profileUpdate.bank_account = bank_account;

    if (Object.keys(profileUpdate).length > 0) {
      profileUpdate.updated_at = new Date().toISOString();
      const { data: existingRole } = await supabase
        .from('user_profiles_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role_type', activeRole)
        .maybeSingle();

      if (existingRole) {
        await supabase
          .from('user_profiles_roles')
          .update(profileUpdate)
          .eq('id', existingRole.id);
      } else {
        await supabase
          .from('user_profiles_roles')
          .insert({
            user_id: userId,
            role_type: activeRole,
            ...profileUpdate,
          });
      }
    }

    return res.json({
      success: true,
      message: 'Profil berhasil diperbarui.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/users/roles/set-role
 * Sets single permanent role and business profile (1 Account = 1 Role)
 */
router.post('/roles/set-role', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.user_id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID tidak ditemukan.' });
    }

    const { role_type, business_name, city_region, category, phone_wa, bio_description } = req.body;

    const validRoles: RoleType[] = ['EO', 'VENDOR', 'TALENT', 'TENANT', 'SPONSOR', 'CREW'];
    if (!validRoles.includes(role_type)) {
      return res.status(400).json({
        success: false,
        error: `Peran tidak valid. Pilihan: ${validRoles.join(', ')}`,
      });
    }

    // 1 Account = 1 Permanent Role rule: check if user already has any role registered
    const { data: existingRoles } = await supabase
      .from('user_profiles_roles')
      .select('*')
      .eq('user_id', userId);

    if (existingRoles && existingRoles.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Akun ini sudah memiliki peran permanen (${existingRoles[0].role_type}). Setiap akun hanya dapat memiliki 1 peran dan tidak dapat berpindah peran.`,
      });
    }

    // Insert new profile role
    const { data: newProfile, error: profileErr } = await supabase
      .from('user_profiles_roles')
      .insert({
        user_id: userId,
        role_type,
        business_name: business_name || `Mitra ${role_type}`,
        city_region: city_region || 'Jakarta',
      })
      .select()
      .single();

    if (profileErr) {
      return res.status(500).json({ success: false, error: profileErr.message });
    }

    // Update phone_wa in users table if provided
    if (phone_wa) {
      await supabase.from('users').update({ phone_wa }).eq('id', userId);
    }

    // If role is TALENT, ensure talent_profiles row exists
    if (role_type === 'TALENT') {
      await supabase.from('talent_profiles').insert({
        user_id: userId,
        stage_name: business_name || 'Grup Musik',
        genre: category || 'Indie Rock',
        base_rate: 25000000,
        technical_riders: ['Line Array Monitor', 'Wireless Mic Shure SM58', 'Drum Set Mapex Horizon'],
        hospitality_riders: ['Ruang Tunggu Ber-AC', 'Air Mineral 2 Dus', 'Snack & Buah Segar'],
      });
    }

    // If role is VENDOR, create a starter package in catalog
    if (role_type === 'VENDOR') {
      await supabase.from('vendor_packages').insert({
        vendor_id: userId,
        package_name: 'Paket Sound & Tata Lampu Konser Standard',
        category: category || 'SOUND',
        base_price: 35000000,
        daily_quota: 2,
        tech_specs: ['10.000 Watt Sound System', '12 Par LED RGBW', 'Mixer Digital 32 Channel'],
      });
    }

    invalidateCache('/api/v1/users/partners');

    return res.status(201).json({
      success: true,
      message: `Peran ${role_type} berhasil diaktifkan secara permanen untuk akun Anda.`,
      activeRole: role_type,
      profile: newProfile,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/users/roles/switch
 * Enforces single-role constraint: returns refusal
 */
router.post('/roles/switch', async (req: Request, res: Response) => {
  return res.status(400).json({
    success: false,
    error: 'Setiap akun Event Yuk hanya memiliki 1 peran permanen. Fitur beralih peran telah dinonaktifkan demi integritas transaksi dan kontrak hukum.',
  });
});

/**
 * GET /api/v1/users/catalog/my-catalog
 * Returns catalog items owned by current user based on their active role
 */
router.get('/catalog/my-catalog', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.user_id as string);
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID diperlukan.' });
    }

    const { data: roleData } = await supabase
      .from('user_profiles_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!roleData) {
      return res.status(400).json({ success: false, error: 'User belum memiliki peran terdaftar.' });
    }

    const role = roleData.role_type;
    let catalogItems: any[] = [];
    let extraDetails: any = null;

    if (role === 'VENDOR') {
      const { data: pkgs } = await supabase
        .from('vendor_packages')
        .select('*')
        .eq('vendor_id', userId)
        .order('created_at', { ascending: false });
      catalogItems = pkgs || [];
    } else if (role === 'TALENT') {
      const { data: profile } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      extraDetails = profile;
      if (profile) {
        catalogItems = [
          {
            id: profile.id,
            package_name: `Paket Live Performance - ${profile.stage_name}`,
            category: profile.genre || 'Live Band',
            base_price: profile.base_rate || 35000000,
            tech_specs: profile.technical_riders || [],
            hospitality_riders: profile.hospitality_riders || [],
          }
        ];
      }
    } else if (role === 'EO') {
      const { data: evts } = await supabase
        .from('events')
        .select(`
          *,
          tenant_booths (*),
          crew_shifts (*)
        `)
        .eq('organizer_id', userId)
        .order('created_at', { ascending: false });
      catalogItems = evts || [];
    } else if (role === 'TENANT') {
      const { data: registrations } = await supabase
        .from('tenant_registrations')
        .select(`
          *,
          tenant_booths (*)
        `)
        .eq('tenant_user_id', userId);
      catalogItems = registrations || [];
    } else if (role === 'CREW') {
      const { data: applications } = await supabase
        .from('crew_applications')
        .select(`
          *,
          crew_shifts (
            *,
            events (title, venue_name, start_date)
          )
        `)
        .eq('crew_user_id', userId);
      catalogItems = applications || [];
    }

    return res.json({
      success: true,
      role,
      profile: roleData,
      catalogItems,
      extraDetails,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/users/catalog/item
 * Adds or updates a catalog item for the user
 */
router.post('/catalog/item', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.user_id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID diperlukan.' });
    }

    const { data: roleData } = await supabase
      .from('user_profiles_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!roleData) {
      return res.status(400).json({ success: false, error: 'User belum memiliki peran terdaftar.' });
    }

    const role = roleData.role_type;
    const body = req.body;

    if (role === 'VENDOR') {
      const allowedCategories = ['SOUND', 'STAGE', 'LIGHTING', 'TENT'];
      const rawCat = (body.category || 'SOUND').toString().toUpperCase();
      let category = 'SOUND';
      if (allowedCategories.includes(rawCat)) {
        category = rawCat;
      } else if (rawCat.includes('STAGE') || rawCat.includes('RIGGING')) {
        category = 'STAGE';
      } else if (rawCat.includes('LIGHT') || rawCat.includes('BEAM') || rawCat.includes('LED')) {
        category = 'LIGHTING';
      } else if (rawCat.includes('TENT') || rawCat.includes('TENDA') || rawCat.includes('BOOTH')) {
        category = 'TENT';
      }

      const { data: newPkg, error } = await supabase
        .from('vendor_packages')
        .insert({
          vendor_id: userId,
          package_name: body.package_name || 'Paket Peralatan Baru',
          category,
          base_price: Number(body.base_price) || 10000000,
          daily_quota: Number(body.daily_quota) || 1,
          tech_specs: body.tech_specs || ['Spesifikasi Teknis Standar'],
          is_active: true,
        })
        .select()
        .single();

      if (error) return res.status(500).json({ success: false, error: error.message });
      return res.status(201).json({ success: true, item: newPkg, message: 'Paket alat berhasil ditambahkan ke katalog.' });
    }

    if (role === 'TALENT') {
      const { data: updated, error } = await supabase
        .from('talent_profiles')
        .upsert({
          user_id: userId,
          stage_name: body.stage_name || roleData.business_name || 'Artis',
          genre: body.genre || 'Pop',
          base_rate: Number(body.base_price) || 25000000,
          technical_riders: body.tech_specs || [],
          hospitality_riders: body.hospitality_riders || [],
        })
        .select()
        .single();

      if (error) return res.status(500).json({ success: false, error: error.message });
      invalidateCache('/api/v1/users/partners');
      return res.status(201).json({ success: true, item: updated, message: 'Katalog & riders manggung berhasil diperbarui.' });
    }

    invalidateCache('/api/v1/users/partners');
    return res.status(200).json({ success: true, message: 'Katalog berhasil diperbarui.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/v1/users/catalog/item/:id
 * Removes a package/item from catalog
 */
router.delete('/catalog/item/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await supabase.from('vendor_packages').delete().eq('id', id);
    invalidateCache('/api/v1/users/partners');
    return res.json({ success: true, message: 'Item katalog berhasil dihapus.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/users/wallet
 * Fetches user real-time wallet (escrow_locked vs available_bal)
 */
router.get('/wallet', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || 'a0000000-0000-0000-0000-000000000001';

    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !wallet) {
      return res.status(404).json({ success: false, error: 'Dompet tidak ditemukan.' });
    }

    return res.json({
      success: true,
      wallet,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/users/partners
 * Returns real verified partners (Vendors, Bands, Sponsors) from database
 */
router.get('/partners', cacheResponse(60), async (req: Request, res: Response) => {
  try {
    const { type } = req.query; // 'VENDOR' | 'TALENT' | 'SPONSOR' | 'EO'

    let query = supabase
      .from('user_profiles_roles')
      .select(`
        *,
        user:user_id (
          id,
          full_name,
          email,
          phone_wa,
          kyc_status
        )
      `);

    if (type) {
      query = query.eq('role_type', type as string);
    }

    const { data: roles, error } = await query;
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    // Also fetch vendor packages and talent profiles from Supabase
    const { data: packages } = await supabase.from('vendor_packages').select('*');
    const { data: talents } = await supabase.from('talent_profiles').select('*');

    const formatted = (roles || []).map((r: any) => {
      const u = r.user || {};
      const userPkgs = (packages || []).filter((p: any) => p.vendor_id === r.user_id);
      const userTalent = (talents || []).find((t: any) => t.user_id === r.user_id);

      let priceRange = 'Mulai Rp 25.000.000';
      if (r.role_type === 'VENDOR' && userPkgs.length > 0) {
        const prices = userPkgs.map((p: any) => Number(p.base_price)).sort((a: number, b: number) => a - b);
        priceRange = `Rp ${prices[0].toLocaleString('id-ID')} - Rp ${prices[prices.length - 1].toLocaleString('id-ID')} / Hari`;
      } else if (r.role_type === 'TALENT' && userTalent) {
        priceRange = `Rp ${Number(userTalent.base_rate).toLocaleString('id-ID')} / Sesi Live`;
      } else if (r.role_type === 'SPONSOR') {
        priceRange = 'Mulai Rp 25.000.000 - Rp 175.000.000';
      }

      let avatar = '/assets/vendor-sound.jpg';
      if (r.role_type === 'TALENT') {
        if (r.business_name?.includes('Jazz')) avatar = '/assets/band-jazz.jpg';
        else if (r.business_name?.includes('Folk')) avatar = '/assets/band-folk.jpg';
        else avatar = '/assets/band-rock.jpg';
      } else if (r.role_type === 'VENDOR') {
        if (r.business_name?.includes('Visual') || r.business_name?.includes('LED')) avatar = '/assets/vendor-lighting.jpg';
        else if (r.business_name?.includes('Rigging')) avatar = '/assets/vendor-rigging.jpg';
        else avatar = '/assets/vendor-sound.jpg';
      } else if (r.role_type === 'SPONSOR') {
        avatar = '/assets/sponsor-activation.jpg';
      } else if (r.role_type === 'EO') {
        avatar = '/assets/crowd-festival.jpg';
      } else if (r.role_type === 'TENANT') {
        avatar = '/assets/tenant-food.jpg';
      }

      return {
        id: r.user_id,
        name: r.business_name || u.full_name || 'Mitra Event Yuk',
        type: r.role_type,
        categoryLabel:
          r.role_type === 'VENDOR'
            ? 'Vendor Produksi Alat & Rigging'
            : r.role_type === 'TALENT'
            ? 'Grup Musik & Musisi Panggung'
            : r.role_type === 'SPONSOR'
            ? 'Mitra Brand FMCG / Korporasi'
            : 'Penyelenggara Acara Resmi',
        city: r.city_region || 'Jakarta',
        rating: Number(r.rating_avg) || 4.9,
        avatar,
        priceRange,
        specsOrRiders:
          userPkgs.length > 0
            ? userPkgs.map((p: any) => `${p.package_name} (Rp ${Number(p.base_price).toLocaleString('id-ID')})`)
            : userTalent
            ? [`Genre: ${userTalent.genre}`, 'Durasi Penampilan: 45-60 Menit', 'Riders Teknis & Konsumsi Terkunci']
            : ['Mitra Resmi Terverifikasi e-KYC', 'Kontrak PKS Digital Mengikat'],
        description:
          r.role_type === 'VENDOR'
            ? 'Penyedia perlengkapan panggung, sound system line array, dan tata lampu bergaransi BAST.'
            : r.role_type === 'TALENT'
            ? `Band panggung profesional bergenre ${userTalent?.genre || 'Indie Rock'}.`
            : 'Mitra kolaborasi resmi terdaftar di ekosistem Event Yuk.',
        completedGigs: 45,
        experienceYears: 6,
      };
    });

    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/users/partners/:id
 * Returns deep single partner details (Vendor specs or Band riders)
 */
router.get('/partners/:id', cacheResponse(60), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: profile, error } = await supabase
      .from('user_profiles_roles')
      .select(`
        *,
        user:user_id (
          id,
          full_name,
          email,
          phone_wa,
          kyc_status
        )
      `)
      .or(`user_id.eq.${id},id.eq.${id}`)
      .limit(1)
      .maybeSingle();

    if (error || !profile) {
      return res.status(404).json({ success: false, error: 'Mitra tidak ditemukan.' });
    }

    const { data: packages } = await supabase
      .from('vendor_packages')
      .select('*')
      .eq('vendor_id', profile.user_id);

    const { data: talent } = await supabase
      .from('talent_profiles')
      .select('*')
      .eq('user_id', profile.user_id)
      .maybeSingle();

    const u = profile.user || {};

    let avatar = '/assets/vendor-sound.jpg';
    if (profile.role_type === 'TALENT') {
      if (profile.business_name?.includes('Jazz')) avatar = '/assets/band-jazz.jpg';
      else if (profile.business_name?.includes('Folk')) avatar = '/assets/band-folk.jpg';
      else avatar = '/assets/band-rock.jpg';
    } else if (profile.role_type === 'VENDOR') {
      if (profile.business_name?.includes('Visual') || profile.business_name?.includes('LED')) avatar = '/assets/vendor-lighting.jpg';
      else if (profile.business_name?.includes('Rigging')) avatar = '/assets/vendor-rigging.jpg';
      else avatar = '/assets/vendor-sound.jpg';
    } else if (profile.role_type === 'SPONSOR') {
      avatar = '/assets/sponsor-activation.jpg';
    } else if (profile.role_type === 'EO') {
      avatar = '/assets/crowd-festival.jpg';
    }

    const detail = {
      id: profile.user_id,
      name: profile.business_name || u.full_name || 'Mitra Event Yuk',
      type: profile.role_type,
      categoryLabel:
        profile.role_type === 'VENDOR'
          ? 'Vendor Produksi Alat & Rigging'
          : profile.role_type === 'TALENT'
          ? 'Grup Musik & Musisi Panggung'
          : profile.role_type === 'SPONSOR'
          ? 'Mitra Brand FMCG / Korporasi'
          : 'Penyelenggara Acara Resmi',
      city: profile.city_region || 'Jakarta',
      rating: Number(profile.rating_avg) || 4.95,
      avatar,
      packages: packages || [],
      talentProfile: talent || null,
      specsOrRiders:
        packages && packages.length > 0
          ? packages.map((p: any) => `${p.package_name} (Rp ${Number(p.base_price).toLocaleString('id-ID')})`)
          : talent
          ? [`Genre: ${talent.genre}`, 'Durasi Penampilan: 45-60 Menit', 'Riders Teknis & Konsumsi Terkunci']
          : ['Mitra Resmi Terverifikasi e-KYC', 'Kontrak PKS Digital Mengikat'],
      description:
        profile.role_type === 'VENDOR'
          ? 'Penyedia perlengkapan panggung, sound system line array, tata lampu, dan genset silent berstandar keselamatan K3 dengan jaminan BAST digital.'
          : profile.role_type === 'TALENT'
          ? `Grup musik panggung profesional beraliran ${talent?.genre || 'Indie Rock'} dengan reputasi panggung festival terpercaya.`
          : 'Mitra kolaborasi resmi terdaftar di ekosistem Event Yuk.',
      completedGigs: 48,
      experienceYears: 7,
      bankAccount: profile.bank_account,
    };

    return res.json({ success: true, data: detail });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
