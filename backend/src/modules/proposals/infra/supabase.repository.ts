import { AppError } from '../../../shared/errors';
import type { Db } from '../../../shared/db/supabase';
import type { ProposalRecord, ProposalStatus } from '../domain';
import type { NewProposal, ProposalRepository } from '../ports';

function fail(_error: { message: string }): never {
  throw new AppError(500, 'DATABASE_ERROR', 'Terjadi kesalahan pada penyimpanan data.');
}

const toRecord = (r: any): ProposalRecord => ({
  id: r.id,
  eventId: r.event_id,
  senderId: r.sender_id,
  receiverId: r.receiver_id,
  proposalType: r.proposal_type,
  direction: r.direction,
  title: r.title,
  offeredPrice: Number(r.offered_price),
  dealPrice: r.deal_price === null || r.deal_price === undefined ? null : Number(r.deal_price),
  dpPercentage: Number(r.dp_percentage ?? 50),
  counterPrice: r.counter_price === null || r.counter_price === undefined ? null : Number(r.counter_price),
  counterDpPercentage: r.counter_dp_percentage === null || r.counter_dp_percentage === undefined ? null : Number(r.counter_dp_percentage),
  counterNotes: r.counter_notes ?? null,
  scopeOfWork: r.scope_of_work ?? '',
  ridersOrSpecs: r.riders_or_specs ?? {},
  attachedFileName: r.attached_file_name ?? null,
  attachedFileSize: r.attached_file_size ?? null,
  contractDocumentUrl: r.contract_document_url ?? null,
  contractPksNumber: r.contract_pks_number ?? null,
  status: (r.status ?? 'SUBMITTED') as ProposalStatus,
  lastActionBy: r.last_action_by ?? r.sender_id,
  createdAt: r.created_at,
  updatedAt: r.updated_at ?? r.created_at,
});

const toColumns = (p: Partial<ProposalRecord>): Record<string, unknown> => {
  const map: Record<string, string> = {
    status: 'status',
    dealPrice: 'deal_price',
    dpPercentage: 'dp_percentage',
    counterPrice: 'counter_price',
    counterDpPercentage: 'counter_dp_percentage',
    counterNotes: 'counter_notes',
    contractPksNumber: 'contract_pks_number',
    lastActionBy: 'last_action_by',
  };
  return Object.fromEntries(Object.entries(p).filter(([k, v]) => k in map && v !== undefined).map(([k, v]) => [map[k], v]));
};

export class SupabaseProposalRepository implements ProposalRepository {
  constructor(private readonly db: Db) {}

  async create(input: NewProposal) {
    const { data, error } = await this.db
      .from('event_proposals')
      .insert({
        event_id: input.eventId,
        sender_id: input.senderId,
        receiver_id: input.receiverId,
        proposal_type: input.proposalType,
        direction: input.direction,
        title: input.title,
        offered_price: input.offeredPrice,
        deal_price: null,
        dp_percentage: input.dpPercentage,
        scope_of_work: input.scopeOfWork,
        riders_or_specs: input.ridersOrSpecs as never,
        attached_file_name: input.attachedFileName,
        attached_file_size: input.attachedFileSize,
        contract_document_url: input.contractDocumentUrl,
        status: 'SUBMITTED',
        last_action_by: input.senderId,
      })
      .select('*')
      .single();
    if (error) fail(error);
    return toRecord(data);
  }

  async findById(id: string) {
    const { data, error } = await this.db.from('event_proposals').select('*').eq('id', id).maybeSingle();
    if (error) fail(error);
    return data ? toRecord(data) : null;
  }

  async listForUser(userId: string, filter: { eventId?: string; status?: ProposalStatus }) {
    // userId is a validated UUID from the token, never raw request input.
    let query = this.db.from('event_proposals').select('*').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    if (filter.eventId) query = query.eq('event_id', filter.eventId);
    if (filter.status) query = query.eq('status', filter.status);
    const { data, error } = await query.order('created_at', { ascending: false }).limit(200);
    if (error) fail(error);
    return (data ?? []).map(toRecord);
  }

  async transition(id: string, from: ProposalStatus[], patch: Partial<ProposalRecord>) {
    const { data, error } = await this.db
      .from('event_proposals')
      .update({ ...toColumns(patch), updated_at: new Date().toISOString() } as never)
      .eq('id', id)
      .in('status', from)
      .select('*');
    if (error) fail(error);
    return data && data.length ? toRecord(data[0]) : null;
  }

  async countByStatusForUser(userId: string, status: ProposalStatus) {
    const { count, error } = await this.db
      .from('event_proposals')
      .select('id', { count: 'exact', head: true })
      .eq('status', status)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    if (error) fail(error);
    return count ?? 0;
  }
}
