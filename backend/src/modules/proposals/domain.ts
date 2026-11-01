import { badRequest, conflict, forbidden } from '../../shared/errors';
import type { ProposalKind } from '../events';
import type { Role } from '../../shared/types';

export type ProposalStatus = 'SUBMITTED' | 'COUNTER_OFFER' | 'CONTRACT_SIGNED' | 'ESCROW_FUNDED' | 'REJECTED';
export type Direction = 'EO_TO_PARTNER' | 'PARTNER_TO_EO';

export interface ProposalRecord {
  id: string;
  eventId: string;
  senderId: string;
  receiverId: string;
  proposalType: ProposalKind;
  direction: Direction;
  title: string;
  offeredPrice: number;
  dealPrice: number | null;
  dpPercentage: number;
  counterPrice: number | null;
  counterDpPercentage: number | null;
  counterNotes: string | null;
  scopeOfWork: string;
  ridersOrSpecs: unknown;
  attachedFileName: string | null;
  attachedFileSize: string | null;
  contractDocumentUrl: string | null;
  contractPksNumber: string | null;
  status: ProposalStatus;
  lastActionBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Negotiation rules, kept free of I/O so they can be tested exhaustively.
 *
 *   SUBMITTED ──counter──▶ COUNTER_OFFER ──counter──▶ COUNTER_OFFER ...
 *       │                       │
 *       └────accept────▶ CONTRACT_SIGNED ──(payment confirmed)──▶ ESCROW_FUNDED
 *   SUBMITTED / COUNTER_OFFER ──reject (either party)──▶ REJECTED
 *
 * Counter and accept belong to the party that did NOT act last. Funding is never
 * triggered by a client; only the payments module can do it.
 */
const NEGOTIABLE: ProposalStatus[] = ['SUBMITTED', 'COUNTER_OFFER'];

export const isNegotiable = (p: ProposalRecord) => NEGOTIABLE.includes(p.status);
export const isParty = (p: ProposalRecord, userId: string) => p.senderId === userId || p.receiverId === userId;
export const isTurnOf = (p: ProposalRecord, userId: string) => isParty(p, userId) && p.lastActionBy !== userId;

export function assertParty(p: ProposalRecord, userId: string): void {
  if (!isParty(p, userId)) throw forbidden('Kamu bukan pihak dalam pengajuan ini.');
}

export function assertCanAct(p: ProposalRecord, userId: string, action: 'counter' | 'accept' | 'reject'): void {
  assertParty(p, userId);
  if (!isNegotiable(p)) throw conflict(`Pengajuan ini sudah berstatus ${p.status} dan tidak bisa diubah lagi.`);
  if (action !== 'reject' && !isTurnOf(p, userId)) {
    throw conflict('Saat ini giliran pihak lain untuk menanggapi. Kamu bisa menunggu atau membatalkan pengajuan.');
  }
}

/** The partner role a proposal type is addressed to or sent from. */
const KIND_BY_PARTNER_ROLE: Record<Exclude<Role, 'EO'>, ProposalKind> = {
  VENDOR: 'VENDOR',
  TALENT: 'TALENT',
  TENANT: 'TENANT',
  CREW: 'CREW',
  SPONSOR: 'SPONSOR',
};

export function assertKindMatchesPartner(proposalType: ProposalKind, partnerRole: Role): void {
  if (partnerRole === 'EO') throw badRequest('Pengajuan kerja sama ditujukan ke mitra, bukan ke sesama penyelenggara.');
  if (KIND_BY_PARTNER_ROLE[partnerRole] !== proposalType) {
    throw badRequest(`Jenis pengajuan ${proposalType} tidak cocok dengan peran mitra (${partnerRole}).`);
  }
}

/** Who pays the deposit: the sponsor for sponsorships, the organizer for everything else. */
export function payerOf(p: Pick<ProposalRecord, 'proposalType' | 'senderId' | 'receiverId'>, organizerId: string): { payerId: string; payeeId: string } {
  const partnerId = p.senderId === organizerId ? p.receiverId : p.senderId;
  return p.proposalType === 'SPONSOR' ? { payerId: partnerId, payeeId: organizerId } : { payerId: organizerId, payeeId: partnerId };
}

export const depositAmount = (dealPrice: number, dpPercentage: number) => Math.round((dealPrice * dpPercentage) / 100);
