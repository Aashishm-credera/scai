import { DiagnosticHandler } from '@dataweavers/arc-core';

const handler = new DiagnosticHandler({
  secretKey: process.env.DIAGNOSTICS_SECRET_KEY,
});

export const { GET, POST } = handler.getAppRouterHandler();
