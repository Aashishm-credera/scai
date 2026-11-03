import { createGraphQLClientFactory } from '@sitecore-content-sdk/nextjs/client';
import scConfig from 'sitecore.config';

/**
 * GraphQL client for custom Experience Edge (or local CM) queries that the Content SDK
 * services do not cover. Uses the same endpoint resolution as the SitecoreClient.
 */
const graphQLClient = createGraphQLClientFactory({ api: scConfig.api })();

export default graphQLClient;
