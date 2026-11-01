import { randomUUID } from 'node:crypto';
import { badRequest, conflict, forbidden, notFound } from '../../shared/errors';
import type { EventBus } from '../../shared/events/bus';
import type { AuthContext } from '../../shared/types';
import type { EventsApi } from '../events';
import type { IdentityApi } from '../identity';
import {
  assertCanAct,
  assertKindMatchesPartner,
  assertParty,
  isTurnOf,
  type ProposalRecord,
  type ProposalStatus,
} from './domain';
import type { ProposalRepository } from './ports';
import type { CounterInput, CreateProposalInput } from './schemas';

export interface PaymentView {
  id: string;
  eventId: string;
  title: string;
  senderId: string;
  receiverId: string;
  proposalType: ProposalRecord['proposalType'];
  status: ProposalStatus;
  dealPrice: number | null;
  dpPercentage: number;
}

export class ProposalsService {
  constructor(
    private readonly repo: ProposalRepository,
    private readonly identity: IdentityApi,
    private readonly events: EventsApi,
    private readonly bus: EventBus
  ) {}

  private async present(p: ProposalRecord, viewerId: string) {
    const [event, sender, receiver] = await Promise.all([
      this.events.getSummary(p.eventId),
      this.identity.getPublicProfile(p.senderId),
      this.identity.getPublicProfile(p.receiverId),
    ]);
    return {
      id: p.id,
      event_id: p.eventId,
      sender_id: p.senderId,
      receiver_id: p.receiverId,
      proposal_type: p.proposalType,
      direction: p.direction,
      title: p.title,
      offered_price: p.offeredPrice,
      deal_price: p.dealPrice,
      dp_percentage: p.dpPercentage,
      counter_price: p.counterPrice,
      counter_dp_percentage: p.counterDpPercentage,
      counter_notes: p.counterNotes,
      scope_of_work: p.scopeOfWork,
      riders_or_specs: p.ridersOrSpecs,
      attached_file_name: p.attachedFileName,
      attached_file_size: p.attachedFileSize,
      contract_document_url: p.contractDocumentUrl,
      contract_pks_number: p.contractPksNumber,
      status: p.status,
      last_action_by: p.lastActionBy,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
      my_turn: p.status === 'SUBMITTED' || p.status === 'COUNTER_OFFER' ? isTurnOf(p, viewerId) : false,
      event: event ? { id: event.id, title: event.title, event_category: event.category, venue_name: event.venueName, start_date: event.startDate } : null,
      sender: sender ? { id: sender.userId, full_name: sender.name } : null,
      receiver: receiver ? { id: receiver.userId, full_name: receiver.name } : null,
    };
  }

  private async load(id: string): Promise<ProposalRecord> {
    const p = await this.repo.findById(id);
    if (!p) throw notFound('Pengajuan tidak ditemukan.');
    return p;
  }

  async create(auth: AuthContext, input: CreateProposalInput) {
    if (!auth.role) throw badRequest('Pilih peran akun dulu sebelum mengajukan kerja sama.');
    if (input.receiver_id === auth.userId) throw badRequest('Kamu tidak bisa mengajukan ke dirimu sendiri.');

    const event = await this.events.getSummary(input.event_id);
    if (!event) throw notFound('Acara tidak ditemukan.');
    if (event.isPortfolio || (event.status !== 'PUBLISHED' && event.status !== 'ONGOING')) {
      throw badRequest('Acara ini tidak sedang membuka kerja sama.');
    }

    const receiver = await this.identity.getPublicProfile(input.receiver_id);
    if (!receiver) throw notFound('Penerima pengajuan tidak ditemukan.');

    if (input.direction === 'EO_TO_PARTNER') {
      if (event.organizerId !== auth.userId) throw forbidden('Hanya penyelenggara acara ini yang bisa mengundang mitra.');
      assertKindMatchesPartner(input.proposal_type, receiver.role);
    } else {
      if (event.organizerId !== input.receiver_id) throw badRequest('Pengajuan harus ditujukan ke penyelenggara acara ini.');
      assertKindMatchesPartner(input.proposal_type, auth.role);
      if (!event.acceptsProposalsFrom[input.proposal_type]) throw forbidden('Penyelenggara tidak membuka pengajuan untuk jenis ini.');
    }

    const created = await this.repo.create({
      eventId: input.event_id,
      senderId: auth.userId,
      receiverId: input.receiver_id,
      proposalType: input.proposal_type,
      direction: input.direction,
      title: input.title,
      offeredPrice: input.offered_price,
      dpPercentage: input.dp_percentage,
      scopeOfWork: input.scope_of_work,
      ridersOrSpecs: input.riders_or_specs,
      attachedFileName: input.attached_file_name ?? null,
      attachedFileSize: input.attached_file_size ?? null,
      contractDocumentUrl: input.contract_document_url ?? null,
    });
    await this.bus.emit('proposals.created', { proposalId: created.id, title: created.title, senderId: created.senderId, receiverId: created.receiverId });
    return this.present(created, auth.userId);
  }

  async list(auth: AuthContext, filter: { eventId?: string; status?: ProposalStatus }) {
    const rows = await this.repo.listForUser(auth.userId, filter);
    return Promise.all(rows.map((p) => this.present(p, auth.userId)));
  }

  async counter(auth: AuthContext, id: string, input: CounterInput) {
    const p = await this.load(id);
    assertCanAct(p, auth.userId, 'counter');
    const updated = await this.repo.transition(id, ['SUBMITTED', 'COUNTER_OFFER'], {
      status: 'COUNTER_OFFER',
      counterPrice: input.counter_price,
      counterDpPercentage: input.counter_dp_percentage ?? p.dpPercentage,
      counterNotes: input.counter_notes ?? null,
      lastActionBy: auth.userId,
    });
    if (!updated) throw conflict('Pengajuan ini baru saja berubah. Muat ulang lalu coba lagi.');
    await this.bus.emit('proposals.countered', { proposalId: id, title: updated.title, actorId: auth.userId, otherId: updated.senderId === auth.userId ? updated.receiverId : updated.senderId });
    return this.present(updated, auth.userId);
  }

  async respond(auth: AuthContext, id: string, action: 'ACCEPT' | 'REJECT') {
    const p = await this.load(id);
    assertCanAct(p, auth.userId, action === 'ACCEPT' ? 'accept' : 'reject');

    const patch: Partial<ProposalRecord> =
      action === 'REJECT'
        ? { status: 'REJECTED', lastActionBy: auth.userId }
        : {
            status: 'CONTRACT_SIGNED',
            dealPrice: p.counterPrice ?? p.offeredPrice,
            dpPercentage: p.counterDpPercentage ?? p.dpPercentage,
            contractPksNumber: `PKS/EY/${new Date().getFullYear()}/${randomUUID().slice(0, 8).toUpperCase()}`,
            lastActionBy: auth.userId,
          };
    const updated = await this.repo.transition(id, ['SUBMITTED', 'COUNTER_OFFER'], patch);
    if (!updated) throw conflict('Pengajuan ini baru saja berubah. Muat ulang lalu coba lagi.');
    await this.bus.emit('proposals.responded', { proposalId: id, title: updated.title, actorId: auth.userId, otherId: updated.senderId === auth.userId ? updated.receiverId : updated.senderId, action });
    return this.present(updated, auth.userId);
  }

  // ---------------------------------------------------------------- for other modules

  async getForPayment(id: string, requesterId: string): Promise<PaymentView | null> {
    const p = await this.repo.findById(id);
    if (!p) return null;
    assertParty(p, requesterId);
    return this.toPaymentView(p);
  }

  /** Used by the webhook, which acts on behalf of the payment gateway rather than a user. */
  async getForPaymentUnchecked(id: string): Promise<PaymentView | null> {
    const p = await this.repo.findById(id);
    return p ? this.toPaymentView(p) : null;
  }

  private toPaymentView(p: ProposalRecord): PaymentView {
    return {
      id: p.id,
      eventId: p.eventId,
      title: p.title,
      senderId: p.senderId,
      receiverId: p.receiverId,
      proposalType: p.proposalType,
      status: p.status,
      dealPrice: p.dealPrice,
      dpPercentage: p.dpPercentage,
    };
  }

  /** Idempotent: calling it again for an already funded proposal is a no-op. */
  async markEscrowFunded(id: string): Promise<void> {
    const p = await this.load(id);
    if (p.status === 'ESCROW_FUNDED') return;
    if (p.status !== 'CONTRACT_SIGNED') throw conflict('Kontrak belum siap didanai.');
    await this.repo.transition(id, ['CONTRACT_SIGNED'], { status: 'ESCROW_FUNDED' });
  }

  countFundedFor(userId: string): Promise<number> {
    return this.repo.countByStatusForUser(userId, 'ESCROW_FUNDED');
  }
}
