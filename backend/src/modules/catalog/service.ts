import { matchesQuery } from '../../shared/search';
import { badRequest, forbidden, notFound } from '../../shared/errors';
import type { AuthContext, Role } from '../../shared/types';
import type { EventsApi } from '../events';
import type { IdentityApi, PublicProfile } from '../identity';
import type { ProposalsApi } from '../proposals';
import { categoryLabel, placeholderAvatar, presentPackage, presentTalent, priceRange } from './presentation';
import type { CatalogRepository, TalentProfile, VendorPackage } from './ports';
import type { TalentItemInput, VendorItemInput } from './schemas';

export class CatalogService {
  constructor(
    private readonly repo: CatalogRepository,
    private readonly identity: IdentityApi,
    private readonly events: EventsApi,
    private readonly proposals: ProposalsApi
  ) {}

  private partner(
    p: PublicProfile,
    packages: VendorPackage[],
    talent: TalentProfile | undefined,
    completedGigs: number
  ) {
    const prices =
      p.role === 'VENDOR' ? packages.map((x) => x.basePrice) : p.role === 'TALENT' && talent?.baseRate ? [talent.baseRate] : [];
    const range = priceRange(prices);
    return {
      id: p.userId,
      name: p.name,
      type: p.role,
      categoryLabel: categoryLabel(p.role),
      city: p.cityRegion,
      rating: p.ratingAvg,
      verified: p.verified,
      avatar: placeholderAvatar(p.role, p.name),
      priceRange: range ? (p.role === 'TALENT' ? `${range} / sesi` : p.role === 'VENDOR' ? `${range} / hari` : range) : null,
      specsOrRiders:
        p.role === 'VENDOR'
          ? packages.map((x) => `${x.packageName} (${`Rp ${x.basePrice.toLocaleString('id-ID')}`})`)
          : talent
            ? [`Genre: ${talent.genre ?? '-'}`]
            : [],
      completedGigs,
      genreOrCategory: p.role === 'TALENT' ? talent?.genre ?? null : categoryLabel(p.role),
      description:
        p.role === 'VENDOR' ? `${packages.length} paket tersedia` : p.role === 'TALENT' ? talent?.genre ?? '' : '',
    };
  }

  async listPartners(filter: { type?: Role; q?: string; city?: string } = {}) {
    const profiles = (await this.identity.listPublicProfiles(filter.type)).filter((p) => matchesQuery(filter.city, [p.cityRegion]));
    const ids = profiles.map((p) => p.userId);
    const [packages, talents] = await Promise.all([this.repo.listPackagesForVendors(ids), this.repo.listTalentForUsers(ids)]);
    const all = await Promise.all(
      profiles.map(async (p) =>
        this.partner(
          p,
          packages.filter((x) => x.vendorId === p.userId),
          talents.find((t) => t.userId === p.userId),
          await this.proposals.countFundedFor(p.userId)
        )
      )
    );
    return all.filter((x) => matchesQuery(filter.q, [x.name, x.city, x.categoryLabel, ...x.specsOrRiders]));
  }

  async getPartner(id: string, viewer?: AuthContext) {
    const profile = await this.identity.getPublicProfile(id);
    if (!profile) throw notFound('Mitra tidak ditemukan.');
    const [packages, talent, completed] = await Promise.all([
      this.repo.listPackagesByVendor(id),
      this.repo.getTalent(id),
      this.proposals.countFundedFor(id),
    ]);
    return {
      ...this.partner(profile, packages, talent ?? undefined, completed),
      packages: packages.map((x) => ({
        id: x.id,
        package_name: x.packageName,
        category: x.category,
        base_price: x.basePrice,
        daily_quota: x.dailyQuota,
        tech_specs: x.techSpecs,
      })),
      talentProfile: talent
        ? {
            stage_name: talent.stageName,
            genre: talent.genre,
            base_rate: talent.baseRate,
            technical_riders: talent.technicalRiders,
            hospitality_riders: talent.hospitalityRiders,
            // Contact details are for signed-in users only.
            ...(viewer ? { manager_name: talent.managerName, manager_contact: talent.managerContact } : {}),
          }
        : null,
    };
  }

  async myCatalog(auth: AuthContext) {
    const role = auth.role;
    if (!role) throw badRequest('Pilih peran akun dulu.');
    if (role === 'VENDOR') return { role, catalogItems: (await this.repo.listPackagesByVendor(auth.userId)).map(presentPackage), extraDetails: null };
    if (role === 'TALENT') {
      const talent = await this.repo.getTalent(auth.userId);
      return { role, catalogItems: talent ? [presentTalent(talent)] : [], extraDetails: talent ? presentTalent(talent) : null };
    }
    if (role === 'EO' || role === 'TENANT' || role === 'CREW') {
      return { role, catalogItems: await this.events.activityFor(auth.userId, role), extraDetails: null };
    }
    return { role, catalogItems: [], extraDetails: null };
  }

  async addVendorPackage(auth: AuthContext, input: VendorItemInput) {
    if (auth.role !== 'VENDOR') throw forbidden('Hanya vendor yang bisa menambah paket alat.');
    return presentPackage(await this.repo.createPackage({
      vendorId: auth.userId,
      packageName: input.package_name,
      category: input.category,
      basePrice: input.base_price,
      dailyQuota: input.daily_quota,
      techSpecs: input.tech_specs,
    }));
  }

  async saveTalent(auth: AuthContext, input: TalentItemInput) {
    if (auth.role !== 'TALENT') throw forbidden('Hanya band atau musisi yang bisa mengisi katalog penampilan.');
    return presentTalent(await this.repo.upsertTalent({
      userId: auth.userId,
      stageName: input.stage_name,
      genre: input.genre ?? null,
      baseRate: input.base_price,
      technicalRiders: input.tech_specs,
      hospitalityRiders: input.hospitality_riders,
    }));
  }

  async deletePackage(auth: AuthContext, id: string) {
    if (auth.role !== 'VENDOR') throw forbidden();
    if (!(await this.repo.deletePackage(id, auth.userId))) throw notFound('Paket tidak ditemukan.');
  }
}
