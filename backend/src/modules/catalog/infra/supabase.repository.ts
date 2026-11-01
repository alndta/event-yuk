import { AppError } from '../../../shared/errors';
import type { Db } from '../../../shared/db/supabase';
import type { CatalogRepository, TalentProfile, VendorPackage } from '../ports';

function fail(_error: { message: string }): never {
  throw new AppError(500, 'DATABASE_ERROR', 'Terjadi kesalahan pada penyimpanan data.');
}

const toPackage = (r: any): VendorPackage => ({
  id: r.id,
  vendorId: r.vendor_id,
  packageName: r.package_name,
  category: r.category,
  basePrice: Number(r.base_price),
  dailyQuota: Number(r.daily_quota),
  techSpecs: r.tech_specs ?? [],
  isActive: r.is_active ?? true,
  createdAt: r.created_at,
});

const toTalent = (r: any): TalentProfile => ({
  id: r.id,
  userId: r.user_id,
  stageName: r.stage_name,
  genre: r.genre ?? null,
  baseRate: r.base_rate === null || r.base_rate === undefined ? null : Number(r.base_rate),
  technicalRiders: r.technical_riders ?? [],
  hospitalityRiders: r.hospitality_riders ?? [],
  managerName: r.manager_name ?? null,
  managerContact: r.manager_contact ?? null,
});

export class SupabaseCatalogRepository implements CatalogRepository {
  constructor(private readonly db: Db) {}

  async listPackagesForVendors(vendorIds: string[]) {
    if (!vendorIds.length) return [];
    const { data, error } = await this.db.from('vendor_packages').select('*').in('vendor_id', vendorIds).eq('is_active', true);
    if (error) fail(error);
    return (data ?? []).map(toPackage);
  }

  async listPackagesByVendor(vendorId: string) {
    const { data, error } = await this.db.from('vendor_packages').select('*').eq('vendor_id', vendorId).eq('is_active', true).order('created_at', { ascending: false });
    if (error) fail(error);
    return (data ?? []).map(toPackage);
  }

  async createPackage(input: Omit<VendorPackage, 'id' | 'isActive' | 'createdAt'>) {
    const { data, error } = await this.db
      .from('vendor_packages')
      .insert({
        vendor_id: input.vendorId,
        package_name: input.packageName,
        category: input.category,
        base_price: input.basePrice,
        daily_quota: input.dailyQuota,
        tech_specs: input.techSpecs as never,
        is_active: true,
      })
      .select('*')
      .single();
    if (error) fail(error);
    return toPackage(data);
  }

  async deletePackage(id: string, vendorId: string) {
    const { data, error } = await this.db.from('vendor_packages').delete().eq('id', id).eq('vendor_id', vendorId).select('id');
    if (error) fail(error);
    return (data ?? []).length > 0;
  }

  async listTalentForUsers(userIds: string[]) {
    if (!userIds.length) return [];
    const { data, error } = await this.db.from('talent_profiles').select('*').in('user_id', userIds);
    if (error) fail(error);
    return (data ?? []).map(toTalent);
  }

  async getTalent(userId: string) {
    const { data, error } = await this.db.from('talent_profiles').select('*').eq('user_id', userId).maybeSingle();
    if (error) fail(error);
    return data ? toTalent(data) : null;
  }

  async upsertTalent(input: Omit<TalentProfile, 'id' | 'managerName' | 'managerContact'>) {
    const { data, error } = await this.db
      .from('talent_profiles')
      .upsert(
        {
          user_id: input.userId,
          stage_name: input.stageName,
          genre: input.genre,
          base_rate: input.baseRate,
          technical_riders: input.technicalRiders as never,
          hospitality_riders: input.hospitalityRiders as never,
        },
        { onConflict: 'user_id' }
      )
      .select('*')
      .single();
    if (error) fail(error);
    return toTalent(data);
  }
}
