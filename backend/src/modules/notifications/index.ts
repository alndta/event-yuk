import type { Env } from '../../shared/config/env';
import type { EventBus } from '../../shared/events/bus';
import { logger } from '../../shared/logger';
import { escapeHtml, type Mailer } from '../../shared/mail/mailer';
import type { IdentityApi } from '../identity';

interface Deps {
  bus: EventBus;
  identity: IdentityApi;
  mailer: Mailer;
  env: Env;
}

const rupiah = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

/**
 * Tells people by email when something they are part of changes: a new offer, a counter-offer, an answer,
 * a payment, a handover, a release of funds. It only listens to events; no other module calls it, and a
 * failed email never affects the action that caused it.
 */
export function createNotificationsModule({ bus, identity, mailer, env }: Deps) {
  const link = `${env.appBaseUrl.replace(/\/$/, '')}/contracts`;

  async function notify(userId: string, subject: string, line: string) {
    const contact = await identity.getContact(userId);
    if (!contact) return;
    const name = escapeHtml(contact.fullName);
    try {
      await mailer.send({
        to: contact.email,
        subject,
        text: `Halo ${contact.fullName},\n\n${line}\n\nBuka: ${link}`,
        html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#172D46;margin:0 0 12px">${escapeHtml(subject)}</h2>
          <p>Halo ${name},</p>
          <p>${escapeHtml(line)}</p>
          <p><a href="${escapeHtml(link)}" style="display:inline-block;background:#172D46;color:#D7F36A;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">Buka halaman Kontrak</a></p>
        </div>`,
      });
    } catch (err) {
      logger.warn('notification email failed', { subject, error: err instanceof Error ? err.message : String(err) });
    }
  }

  bus.on('proposals.created', ({ receiverId, title }) => notify(receiverId, 'Ada penawaran baru untukmu', `Kamu menerima penawaran baru: "${title}". Lihat dan tanggapi di Event Yuk.`));
  bus.on('proposals.countered', ({ otherId, title }) => notify(otherId, 'Penawaranmu mendapat tawaran balik', `Pihak lain mengajukan perubahan untuk "${title}". Giliranmu menanggapi.`));
  bus.on('proposals.responded', ({ otherId, title, action }) =>
    notify(
      otherId,
      action === 'ACCEPT' ? 'Penawaranmu disetujui' : 'Penawaranmu ditolak',
      action === 'ACCEPT' ? `"${title}" disetujui. Kontrak PKS sudah terbit dan DP bisa dibayarkan.` : `"${title}" ditolak oleh pihak lain.`
    )
  );
  bus.on('payments.escrow_held', async ({ payeeId, payerId, amount }) => {
    await notify(payeeId, 'DP sudah masuk escrow', `Dana ${rupiah(amount)} sudah ditahan di escrow. Kamu bisa mulai bekerja.`);
    await notify(payerId, 'Pembayaran DP diterima', `Pembayaran ${rupiah(amount)} berhasil dan ditahan di escrow sampai pekerjaan disetujui.`);
  });
  bus.on('payments.bast_submitted', ({ payerId }) => notify(payerId, 'BAST menunggu persetujuanmu', 'Penerima dana menandai pekerjaan selesai. Periksa, lalu setujui BAST untuk melepas dana.'));
  bus.on('payments.escrow_released', ({ payeeId, amount }) => notify(payeeId, 'Dana sudah dilepas', `${rupiah(amount)} masuk ke saldo tersedia kamu.`));
}
