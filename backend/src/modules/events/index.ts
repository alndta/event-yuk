import type { ResponseCache } from '../../shared/cache/memoryCache';
import type { EventBus } from '../../shared/events/bus';
import type { AuthGuards } from '../../shared/http/auth';
import type { IdentityApi } from '../identity';
import type { EventRepository } from './ports';
import { createEventsRouter } from './routes';
import { EventsService, type EventSummary } from './service';

export type { EventSummary, ProposalKind } from './service';
export type { EventRepository } from './ports';
export { SupabaseEventRepository } from './infra/supabase.repository';

/** What the rest of the application may ask the events module. */
export interface EventsApi {
  getSummary(eventId: string): Promise<EventSummary | null>;
  activityFor(userId: string, role: 'EO' | 'TENANT' | 'CREW'): Promise<unknown[]>;
}

export function createEventsModule(deps: { repo: EventRepository; identity: IdentityApi; cache: ResponseCache; bus?: EventBus }) {
  const service = new EventsService(deps.repo, deps.identity, deps.bus);
  const api: EventsApi = {
    getSummary: (id) => service.getSummary(id),
    activityFor: (userId, role) => service.activityFor(userId, role),
  };
  return { api, router: (guards: AuthGuards) => createEventsRouter(service, guards, deps.cache) };
}
