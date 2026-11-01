import { z } from 'zod';

const price = z.coerce.number().int().min(1, 'Nominal harus lebih dari 0.').max(100_000_000_000);
const dp = z.coerce.number().int().min(1).max(100);

export const createProposalSchema = z.object({
  event_id: z.uuid(),
  receiver_id: z.uuid(),
  proposal_type: z.enum(['VENDOR', 'TALENT', 'TENANT', 'CREW', 'SPONSOR']),
  direction: z.enum(['EO_TO_PARTNER', 'PARTNER_TO_EO']),
  title: z.string().trim().min(3).max(255),
  offered_price: price,
  dp_percentage: dp.default(50),
  scope_of_work: z.string().trim().max(4000).default(''),
  riders_or_specs: z.record(z.string(), z.unknown()).default({}),
  attached_file_name: z.string().trim().max(255).nullish(),
  attached_file_size: z.union([z.string(), z.number()]).nullish().transform((v) => (v === null || v === undefined ? null : String(v).slice(0, 40))),
  contract_document_url: z.string().max(500).nullish(),
});

export const counterSchema = z.object({
  counter_price: price,
  counter_dp_percentage: dp.optional(),
  counter_notes: z.string().trim().max(2000).optional(),
});

export const respondSchema = z.object({ action: z.enum(['ACCEPT', 'REJECT']) });
export const proposalParams = z.object({ id: z.uuid() });
export const listProposalsQuery = z.object({
  eventId: z.uuid().optional(),
  status: z.enum(['SUBMITTED', 'COUNTER_OFFER', 'CONTRACT_SIGNED', 'ESCROW_FUNDED', 'REJECTED']).optional(),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type CounterInput = z.infer<typeof counterSchema>;
