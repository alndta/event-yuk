import { describe, expect, it } from 'vitest';
import { EventBus } from '../src/shared/events/bus';
import type { DecidedApplicant } from '../src/modules/events/ports';
import { EventsService } from '../src/modules/events/service';

/** Only the review methods are needed; everything else on the repository is irrelevant here. */
function setup(result: DecidedApplicant | null) {
  const calls: unknown[] = [];
  const repo = {
    decideTenant: async (i: unknown) => { calls.push(['tenant', i]); return result; },
    decideCrew: async (i: unknown) => { calls.push(['crew', i]); return result; },
    listApplicants: async () => ({ tenants: [{ id: 't1', userId: 'u1', name: 'Kopi', status: 'PENDING', eventId: 'e1', eventTitle: 'Fest', label: 'FNB-01', detail: 'Budi', createdAt: null }], crew: [] }),
  };
  const bus = new EventBus();
  const heard: unknown[] = [];
  bus.on('events.application_decided', (p) => { heard.push(p); });
  return { service: new EventsService(repo as never, {} as never, bus), calls, heard };
}

describe('organizer review of applicants', () => {
  it('passes the organizer id down, so the repository can limit the decision to their events', async () => {
    const { service, calls } = setup({ userId: 'u1', eventTitle: 'Fest', label: 'FNB-01' });
    await service.decideTenant('eo-1', 'reg-1', true);
    expect(calls[0]).toEqual(['tenant', { organizerId: 'eo-1', registrationId: 'reg-1', approve: true }]);
  });

  it('tells the applicant what was decided', async () => {
    const { service, heard } = setup({ userId: 'u1', eventTitle: 'Fest', label: 'USHER' });
    await service.decideCrew('eo-1', 'app-1', false);
    expect(heard).toEqual([{ userId: 'u1', kind: 'shift', approved: false, eventTitle: 'Fest', label: 'USHER' }]);
  });

  it('answers not found when there is nothing to decide, and announces nothing', async () => {
    const { service, heard } = setup(null);
    await expect(service.decideTenant('eo-1', 'someone-elses', true)).rejects.toThrow(/tidak ditemukan/);
    await expect(service.decideCrew('eo-1', 'someone-elses', true)).rejects.toThrow(/tidak ditemukan/);
    expect(heard).toEqual([]);
  });

  it('presents applicants in the wire format', async () => {
    const { service } = setup(null);
    const { tenants } = await service.applicants('eo-1');
    expect(tenants[0]).toMatchObject({ id: 't1', name: 'Kopi', event_title: 'Fest', label: 'FNB-01' });
  });
});
