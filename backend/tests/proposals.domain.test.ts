import { describe, expect, it } from 'vitest';
import { assertCanAct, isTurnOf, type ProposalRecord } from '../src/modules/proposals/domain';

const base = { senderId: 'eo', receiverId: 'vd', lastActionBy: 'eo', status: 'SUBMITTED' } as ProposalRecord;

describe('proposal state machine', () => {
  it('only the party who did not act last may counter or accept', () => {
    expect(isTurnOf(base, 'vd')).toBe(true);
    expect(isTurnOf(base, 'eo')).toBe(false);
    expect(() => assertCanAct(base, 'eo', 'accept')).toThrow();
    expect(() => assertCanAct(base, 'vd', 'accept')).not.toThrow();
  });
  it('strangers are rejected', () => {
    expect(() => assertCanAct(base, 'evil', 'reject')).toThrow();
  });
  it('finished proposals cannot change', () => {
    expect(() => assertCanAct({ ...base, status: 'ESCROW_FUNDED' }, 'vd', 'reject')).toThrow();
  });
});
