import { logger } from '../logger';

/**
 * Events one module announces and others may react to. Keeping the list here makes the
 * contract between modules visible in one place.
 */
export interface DomainEvents {
  'identity.user_registered': { userId: string };
}

type Handler<T> = (payload: T) => void | Promise<void>;

/** In-process publish/subscribe. A failing subscriber is logged and never breaks the publisher. */
export class EventBus {
  private handlers = new Map<string, Handler<never>[]>();

  on<K extends keyof DomainEvents>(event: K, handler: Handler<DomainEvents[K]>): void {
    this.handlers.set(event, [...(this.handlers.get(event) ?? []), handler as Handler<never>]);
  }

  async emit<K extends keyof DomainEvents>(event: K, payload: DomainEvents[K]): Promise<void> {
    for (const handler of this.handlers.get(event) ?? []) {
      try {
        await (handler as Handler<DomainEvents[K]>)(payload);
      } catch (err) {
        logger.error('event handler failed', { event, error: err instanceof Error ? err.message : String(err) });
      }
    }
  }
}
