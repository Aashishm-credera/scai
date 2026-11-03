import { rm } from 'node:fs/promises';
import { join } from 'node:path';

// `next typegen` refreshes route definitions but does not remove types for
// routes that have been deleted. Clear its generated directory first so a
// standalone typecheck cannot validate stale routes from `.next`.
await rm(join(process.cwd(), '.next', 'types'), {
  recursive: true,
  force: true,
});
