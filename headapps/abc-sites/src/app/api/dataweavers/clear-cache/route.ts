import { CacheClear } from '@dataweavers/redis-page-caching';

const { POST } = new CacheClear(process.env.CACHE_MANAGEMENT_SECRET).getAppRouteHandlers();

export { POST };
