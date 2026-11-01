import { Router, Request, Response } from 'express';
import { supabase } from '../../config/supabase';

const router = Router();

/**
 * GET /api/v1/proposals
 * Query: eventId, senderId, receiverId, status
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { eventId, userId, status } = req.query;
    let query = supabase.from('event_proposals').select(`
      *,
      event:event_id (id, title, event_category, venue_name, start_date),
      sender:sender_id (id, full_name, email),
      receiver:receiver_id (id, full_name, email)
    `);

    if (eventId) {
      query = query.eq('event_id', eventId as string);
    }
    if (userId) {
      query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    }
    if (status) {
      query = query.eq('status', status as string);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, count: data?.length || 0, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/proposals
 * Initial proposal submission
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      event_id,
      sender_id,
      receiver_id,
      proposal_type,
      direction,
      title,
      offered_price,
      dp_percentage,
      scope_of_work,
      riders_or_specs,
      attached_file_name,
      attached_file_size,
      contract_document_url,
    } = req.body;

    if (!event_id || !sender_id || !receiver_id || !title || !proposal_type || !direction) {
      return res.status(400).json({
        success: false,
        error: 'Data pengajuan belum lengkap.',
      });
    }

    const { data, error } = await supabase
      .from('event_proposals')
      .insert({
        event_id,
        sender_id,
        receiver_id,
        proposal_type,
        direction,
        title,
        offered_price: Number(offered_price) || 0,
        deal_price: Number(offered_price) || 0,
        dp_percentage: Number(dp_percentage) || 50,
        scope_of_work: scope_of_work || '',
        riders_or_specs: riders_or_specs || {},
        attached_file_name: attached_file_name || null,
        attached_file_size: attached_file_size || null,
        contract_document_url: contract_document_url || null,
        status: 'SUBMITTED',
        last_action_by: sender_id,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Pengajuan penawaran berhasil dikirim.',
      data,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/proposals/:id/counter
 * Propose change / counter-offer (harga baru, skema pembayaran 70:30, 50:50, riders)
 */
router.post('/:id/counter', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { counter_price, counter_dp_percentage, counter_notes, user_id } = req.body;

    const { data, error } = await supabase
      .from('event_proposals')
      .update({
        counter_price: Number(counter_price),
        counter_dp_percentage: Number(counter_dp_percentage) || 50,
        counter_notes,
        status: 'COUNTER_OFFER',
        last_action_by: user_id || 'a0000000-0000-0000-0000-000000000001',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      message: 'Perubahan penawaran (counter-offer) berhasil diajukan.',
      data,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/proposals/:id/respond
 * Accept or reject proposal / counter-offer
 * Action: 'ACCEPT' | 'REJECT'
 */
router.post('/:id/respond', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, user_id } = req.body;

    const { data: proposal, error: getErr } = await supabase
      .from('event_proposals')
      .select('*')
      .eq('id', id)
      .single();

    if (getErr || !proposal) {
      return res.status(404).json({ success: false, error: 'Pengajuan tidak ditemukan.' });
    }

    if (action === 'REJECT') {
      const { data, error } = await supabase
        .from('event_proposals')
        .update({ status: 'REJECTED', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) return res.status(500).json({ success: false, error: error.message });
      return res.json({ success: true, message: 'Pengajuan telah ditolak.', data });
    }

    if (action === 'ACCEPT') {
      const finalPrice = proposal.counter_price || proposal.offered_price;
      const finalDp = proposal.counter_dp_percentage || proposal.dp_percentage;
      const contractNumber = `PKS/EY/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`;

      const { data, error } = await supabase
        .from('event_proposals')
        .update({
          deal_price: finalPrice,
          dp_percentage: finalDp,
          status: 'CONTRACT_SIGNED',
          contract_pks_number: contractNumber,
          contract_document_url: `/contracts/${contractNumber.replace(/\//g, '-')}.pdf`,
          last_action_by: user_id || 'a0000000-0000-0000-0000-000000000001',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) return res.status(500).json({ success: false, error: error.message });

      return res.json({
        success: true,
        message: 'Pengajuan disetujui bersama! Dokumen PKS digital resmi telah diterbitkan.',
        data,
      });
    }

    return res.status(400).json({ success: false, error: 'Action harus bernilai ACCEPT atau REJECT.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/proposals/sponsorship/packages
 * Fetches all sponsorship packages across events or for a specific event
 */
router.get('/sponsorship/packages', async (req: Request, res: Response) => {
  try {
    const { event_id } = req.query;
    let query = supabase.from('sponsorship_packages').select(`
      *,
      event:event_id (
        id,
        title,
        event_category,
        venue_name,
        start_date,
        organizer:organizer_id (id, full_name, kyc_status)
      )
    `);

    if (event_id) {
      query = query.eq('event_id', event_id as string);
    }

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, count: data?.length || 0, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/proposals/:id/fund-escrow
 * Marks contract as funded and registers escrow ledger transaction in Supabase
 */
router.post('/:id/fund-escrow', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { payer_id } = req.body;

    const { data: proposal, error: getErr } = await supabase
      .from('event_proposals')
      .select('*')
      .eq('id', id)
      .single();

    if (getErr || !proposal) {
      return res.status(404).json({ success: false, error: 'Kontrak tidak ditemukan.' });
    }

    const { data: updatedProposal, error: updateErr } = await supabase
      .from('event_proposals')
      .update({
        status: 'ESCROW_FUNDED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      return res.status(500).json({ success: false, error: updateErr.message });
    }

    // Insert escrow transaction
    const grossAmount = proposal.deal_price || proposal.offered_price || 0;
    const platformFee = Math.round(grossAmount * 0.025); // 2.5% platform fee
    await supabase.from('escrow_transactions').insert({
      event_id: proposal.event_id,
      payer_id: payer_id || proposal.sender_id,
      payee_id: proposal.receiver_id,
      ref_type: 'VENDOR_ORDER',
      ref_id: proposal.id,
      gross_amount: grossAmount,
      platform_fee: platformFee,
      escrow_state: 'ESCROW_HELD',
      idempotency_key: `escrow_${proposal.id}_${Date.now()}`,
    });

    // Update wallet escrow_locked
    const targetUserId = payer_id || proposal.sender_id;
    const { data: currentWallet } = await supabase
      .from('wallets')
      .select('id, escrow_locked')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (currentWallet) {
      await supabase
        .from('wallets')
        .update({
          escrow_locked: Number(currentWallet.escrow_locked || 0) + grossAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentWallet.id);
    }

    return res.json({
      success: true,
      message: 'Dana kontrak berhasil disetorkan dan diamankan di Rekening Bersama Escrow.',
      data: updatedProposal,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
