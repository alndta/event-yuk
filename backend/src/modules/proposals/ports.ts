import type { Direction, ProposalRecord, ProposalStatus } from './domain';

export type NewProposal = Omit<
  ProposalRecord,
  'id' | 'status' | 'dealPrice' | 'counterPrice' | 'counterDpPercentage' | 'counterNotes' | 'contractPksNumber' | 'createdAt' | 'updatedAt' | 'lastActionBy'
> & { direction: Direction };

export interface ProposalRepository {
  create(input: NewProposal): Promise<ProposalRecord>;
  findById(id: string): Promise<ProposalRecord | null>;
  listForUser(userId: string, filter: { eventId?: string; status?: ProposalStatus }): Promise<ProposalRecord[]>;
  /**
   * Applies the patch only if the proposal is still in `from`. Returns null when it moved on in the
   * meantime, which lets two simultaneous requests fail safely instead of overwriting each other.
   */
  transition(id: string, from: ProposalStatus[], patch: Partial<ProposalRecord>): Promise<ProposalRecord | null>;
  countByStatusForUser(userId: string, status: ProposalStatus): Promise<number>;
}
