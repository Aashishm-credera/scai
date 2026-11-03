import { CachePopulate, StaticPath } from '@dataweavers/redis-page-caching';

const paths: StaticPath[] = [];

const { POST } = new CachePopulate(
  process.env.CACHE_MANAGEMENT_SECRET,
  paths,
).getAppRouteHandlers();

export { POST };
