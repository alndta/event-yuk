export type VendorCategory = 'SOUND' | 'STAGE' | 'LIGHTING' | 'TENT';

export interface VendorPackage {
  id: string;
  vendorId: string;
  packageName: string;
  category: VendorCategory;
  basePrice: number;
  dailyQuota: number;
  techSpecs: unknown;
  isActive: boolean;
  createdAt: string;
}

export interface TalentProfile {
  id: string;
  userId: string;
  stageName: string;
  genre: string | null;
  baseRate: number | null;
  technicalRiders: unknown;
  hospitalityRiders: unknown;
  managerName: string | null;
  managerContact: string | null;
}

export interface CatalogRepository {
  listPackagesForVendors(vendorIds: string[]): Promise<VendorPackage[]>;
  listPackagesByVendor(vendorId: string): Promise<VendorPackage[]>;
  createPackage(input: Omit<VendorPackage, 'id' | 'isActive' | 'createdAt'>): Promise<VendorPackage>;
  /** Deletes only a package owned by this vendor. Returns false when there was nothing to delete. */
  deletePackage(id: string, vendorId: string): Promise<boolean>;
  listTalentForUsers(userIds: string[]): Promise<TalentProfile[]>;
  getTalent(userId: string): Promise<TalentProfile | null>;
  upsertTalent(input: Omit<TalentProfile, 'id' | 'managerName' | 'managerContact'>): Promise<TalentProfile>;
}
