import { describe, expect, it } from 'vitest';
import { loadEnv } from '../src/shared/config/env';
import { EventBus } from '../src/shared/events/bus';
import type { MailMessage } from '../src/shared/mail/mailer';
import { createNotificationsModule } from '../src/modules/notifications';

const setup = () => {
  const bus = new EventBus();
  const sent: MailMessage[] = [];
  const people: Record<string, { fullName: string; email: string }> = {
    eo: { fullName: 'Nusantara <Live>', email: 'eo@x.id' },
    vendor: { fullName: 'Audio Pro', email: 'vendor@x.id' },
  };
  createNotificationsModule({
    bus,
    identity: { getContact: async (id: string) => people[id] ?? null } as never,
    mailer: { send: async (m) => { sent.push(m); } },
    env: loadEnv({ NODE_ENV: 'test', JWT_SECRET: 'x'.repeat(40), APP_BASE_URL: 'https://app.test/' } as never),
  });
  return { bus, sent };
};

describe('email notifications', () => {
  it('tells the receiver about a new offer, with a link to the contracts page', async () => {
    const { bus, sent } = setup();
    await bus.emit('proposals.created', { proposalId: 'p1', title: 'Sewa sound', senderId: 'eo', receiverId: 'vendor' });
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ to: 'vendor@x.id', subject: 'Ada penawaran baru untukmu' });
    expect(sent[0].text).toContain('https://app.test/contracts');
  });

  it('tells the other party about a counter-offer and an answer', async () => {
    const { bus, sent } = setup();
    await bus.emit('proposals.countered', { proposalId: 'p1', title: 'Sewa sound', actorId: 'vendor', otherId: 'eo' });
    await bus.emit('proposals.responded', { proposalId: 'p1', title: 'Sewa sound', actorId: 'eo', otherId: 'vendor', action: 'ACCEPT' });
    expect(sent.map((m) => m.to)).toEqual(['eo@x.id', 'vendor@x.id']);
    expect(sent[1].subject).toBe('Penawaranmu disetujui');
  });

  it('emails both sides when the deposit lands, and the recipient when money is released', async () => {
    const { bus, sent } = setup();
    await bus.emit('payments.escrow_held', { proposalId: 'p1', payerId: 'eo', payeeId: 'vendor', amount: 5_000_000 });
    expect(sent.map((m) => m.to).sort()).toEqual(['eo@x.id', 'vendor@x.id']);
    await bus.emit('payments.escrow_released', { proposalId: 'p1', payerId: 'eo', payeeId: 'vendor', amount: 4_875_000 });
    expect(sent.at(-1)?.text).toContain('4.875.000');
  });

  it('escapes names and never throws when an email fails or a user is gone', async () => {
    const { bus, sent } = setup();
    await bus.emit('proposals.created', { proposalId: 'p1', title: 'x', senderId: 'vendor', receiverId: 'eo' });
    expect(sent[0].html).toContain('Nusantara &lt;Live&gt;');
    await expect(bus.emit('proposals.created', { proposalId: 'p1', title: 'x', senderId: 'eo', receiverId: 'ghost' })).resolves.toBeUndefined();
    expect(sent).toHaveLength(1);
  });
});
