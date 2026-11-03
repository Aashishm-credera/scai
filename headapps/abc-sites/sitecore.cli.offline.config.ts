import fs from 'node:fs';
import path from 'node:path';
import type { SitecoreConfig } from '@sitecore-content-sdk/nextjs/config';
import cliConfig, { generateSitesFromEdge } from './sitecore.cli.config';

/**
 * sitecore.cli.config.ts for checks that run without Sitecore credentials, such as the frontend
 * pipeline (.pipelines/abc-sites-frontend-checks.yml). It runs the same build commands, except
 * that the site list is not fetched from Sitecore Edge: .sitecore/sites.json gets only the
 * default site, which is all type checking needs.
 *
 * Never build a deployable app with it. The real site list would be missing.
 */
async function writeDefaultSiteOnly({ scConfig }: { scConfig: SitecoreConfig }) {
  const sites = [{ name: scConfig.defaultSite, hostName: '*', language: scConfig.defaultLanguage }];
  const sitesPath = path.resolve('.sitecore/sites.json');

  fs.mkdirSync(path.dirname(sitesPath), { recursive: true });
  fs.writeFileSync(sitesPath, JSON.stringify(sites, null, 2));
}

const offlineCliConfig = {
  ...cliConfig,
  build: {
    commands: cliConfig.build.commands.map((command) =>
      command === generateSitesFromEdge ? writeDefaultSiteOnly : command
    ),
  },
};

export default offlineCliConfig;
