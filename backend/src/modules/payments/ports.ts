export interface EscrowTransaction {
  id: string;
  eventId: string;
  payerId: string;
  payeeId: string;
  refId: string;
  grossAmount: number;
  platformFee: number;
  state: 'INITIATED' | 'ESCROW_HELD' | 'PARTIALLY_RELEASED' | 'SETTLED' | 'DISPUTED' | 'REFUNDED';
  orderId: string;
}

export interface Wallet {
  escrowLocked: number;
  availableBalance: number;
  currency: string;
}

export interface PaymentsRepository {
  createTransaction(input: Omit<EscrowTransaction, 'id' | 'state'>): Promise<EscrowTransaction>;
  findByOrderId(orderId: string): Promise<EscrowTransaction | null>;
  /**
   * Moves INITIATED to ESCROW_HELD and adds the amount to the payer's locked balance in ONE step.
   * Returns true only for the call that did the move, so a repeated webhook cannot credit twice.
   */
  holdEscrow(transactionId: string): Promise<boolean>;
  getWallet(userId: string): Promise<Wallet | null>;
  ensureWallet(userId: string): Promise<void>;
}

export interface GatewayNotification {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}

export interface GatewayStatus {
  transactionStatus: string;
  fraudStatus: string | null;
}

export interface PaymentGateway {
  readonly configured: boolean;
  createCheckout(input: {
    orderId: string;
    amount: number;
    itemName: string;
    customer: { name: string; email: string };
    finishUrl: string;
  }): Promise<{ token: string; redirectUrl: string }>;
  /** Asks the gateway for the real status of an order instead of trusting the callback body. */
  getStatus(orderId: string): Promise<GatewayStatus>;
  verifySignature(n: GatewayNotification): boolean;
}
