import type { ResponseCache } from '../../shared/cache/memoryCache';
import type { AuthGuards } from '../../shared/http/auth';
import type { EventsApi } from '../events';
import type { IdentityApi } from '../identity';
import type { ProposalsApi } from '../proposals';
import type { CatalogRepository } from './ports';
import { createCatalogRouter } from './routes';
import { CatalogService } from './service';

export type { CatalogRepository } from './ports';
export { SupabaseCatalogRepository } from './infra/supabase.repository';

export function createCatalogModule(deps: {
  repo: CatalogRepository;
  identity: IdentityApi;
  events: EventsApi;
  proposals: ProposalsApi;
  cache: ResponseCache;
}) {
  const service = new CatalogService(deps.repo, deps.identity, deps.events, deps.proposals);
  return { router: (guards: AuthGuards) => createCatalogRouter(service, guards, deps.cache) };
}
