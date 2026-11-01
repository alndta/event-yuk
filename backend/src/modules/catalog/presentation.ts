import type { Role } from '../../shared/types';

/** The database has no photo column yet, so partners get a stock picture chosen by role. */
export function placeholderAvatar(role: Role, name: string): string {
  if (role === 'TALENT') return name.includes('Jazz') ? '/assets/band-jazz.jpg' : name.includes('Folk') ? '/assets/band-folk.jpg' : '/assets/band-rock.jpg';
  if (role === 'VENDOR') {
    if (name.includes('Visual') || name.includes('LED')) return '/assets/vendor-lighting.jpg';
    if (name.includes('Rigging')) return '/assets/vendor-rigging.jpg';
    return '/assets/vendor-sound.jpg';
  }
  if (role === 'SPONSOR') return '/assets/sponsor-activation.jpg';
  if (role === 'TENANT') return '/assets/tenant-food.jpg';
  return '/assets/crowd-festival.jpg';
}

export const categoryLabel = (role: Role): string =>
  ({
    VENDOR: 'Vendor produksi dan rigging',
    TALENT: 'Grup musik dan musisi panggung',
    SPONSOR: 'Brand dan korporasi',
    EO: 'Penyelenggara acara',
    TENANT: 'Tenant kuliner dan pameran',
    CREW: 'Kru lapangan',
  })[role];

const rupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

export function priceRange(prices: number[]): string | null {
  if (!prices.length) return null;
  const sorted = [...prices].sort((a, b) => a - b);
  return sorted[0] === sorted[sorted.length - 1] ? rupiah(sorted[0]) : `${rupiah(sorted[0])} - ${rupiah(sorted[sorted.length - 1])}`;
}
