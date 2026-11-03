import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

const scriptPath = path.resolve(process.cwd(), 'design-tokens/scripts/icons.mjs');
const temporaryDirectories: string[] = [];

function createFixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'abc-icons-workflow-'));
  temporaryDirectories.push(root);

  const inventoryPath = path.join(root, 'inventory.json');
  const exceptionsPath = path.join(root, 'icon-asset-exceptions.json');
  const iconsRoot = path.join(root, 'public', 'icons');
  const generatedPath = path.join(root, 'icon-data.generated.ts');
  const assetDirectory = path.join(iconsRoot, 'interface');
  const assetPath = path.join(assetDirectory, 'check.svg');

  mkdirSync(assetDirectory, { recursive: true });
  writeFileSync(
    inventoryPath,
    `${JSON.stringify(
      {
        generatedFrom: {
          fileKey: 'fixture',
          sourceUrl: 'https://www.figma.com/file/fixture',
          sourceSections: { 'Icon - Interface': '1:1' },
        },
        icons: [
          {
            id: 'interface/general/check',
            name: 'check',
            category: 'interface',
            group: 'general',
            sourceCategory: 'Icon - Interface',
            assetPath: '/icons/interface/check.svg',
          },
        ],
      },
      null,
      2
    )}\n`
  );
  writeFileSync(exceptionsPath, '{}\n');
  writeFileSync(
    assetPath,
    '<svg viewBox="0 0 24 24"><path fill="#000000" d="M0 0h24v24H0z" /></svg>\n'
  );

  const args = [
    scriptPath,
    `--inventory=${inventoryPath}`,
    `--exceptions=${exceptionsPath}`,
    `--icons-root=${iconsRoot}`,
    `--generated=${generatedPath}`,
  ];

  return { args, assetPath, generatedPath };
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('icon workflow', () => {
  it('builds once and passes a read-only check when generated output is current', () => {
    const fixture = createFixture();
    const build = spawnSync(process.execPath, fixture.args, { encoding: 'utf8' });
    expect(build.status, build.stderr).toBe(0);

    const generatedBefore = readFileSync(fixture.generatedPath, 'utf8');
    const svgBefore = readFileSync(fixture.assetPath, 'utf8');
    const check = spawnSync(process.execPath, [...fixture.args, '--check'], {
      encoding: 'utf8',
    });

    expect(check.status, check.stderr).toBe(0);
    expect(readFileSync(fixture.generatedPath, 'utf8')).toBe(generatedBefore);
    expect(readFileSync(fixture.assetPath, 'utf8')).toBe(svgBefore);
  });

  it('accepts CRLF checkout line endings in generated TypeScript', () => {
    const fixture = createFixture();
    const build = spawnSync(process.execPath, fixture.args, { encoding: 'utf8' });
    expect(build.status, build.stderr).toBe(0);

    const generated = readFileSync(fixture.generatedPath, 'utf8');
    writeFileSync(fixture.generatedPath, generated.replace(/\n/g, '\r\n'));
    const check = spawnSync(process.execPath, [...fixture.args, '--check'], {
      encoding: 'utf8',
    });

    expect(check.status, check.stderr).toBe(0);
    expect(readFileSync(fixture.generatedPath, 'utf8')).toContain('\r\n');
  });

  it('exits 1 on stale output and unsanitized SVG drift without writing', () => {
    const fixture = createFixture();
    const build = spawnSync(process.execPath, fixture.args, { encoding: 'utf8' });
    expect(build.status, build.stderr).toBe(0);

    writeFileSync(
      fixture.generatedPath,
      `${readFileSync(fixture.generatedPath, 'utf8')}// stale\n`
    );
    writeFileSync(
      fixture.assetPath,
      readFileSync(fixture.assetPath, 'utf8').replace('currentColor', '#123456')
    );
    const generatedBefore = readFileSync(fixture.generatedPath, 'utf8');
    const svgBefore = readFileSync(fixture.assetPath, 'utf8');

    const check = spawnSync(process.execPath, [...fixture.args, '--check'], {
      encoding: 'utf8',
    });

    expect(check.status).toBe(1);
    expect(check.stderr).toContain('generated TypeScript is stale');
    expect(check.stderr).toContain('SVG requires sanitization');
    expect(readFileSync(fixture.generatedPath, 'utf8')).toBe(generatedBefore);
    expect(readFileSync(fixture.assetPath, 'utf8')).toBe(svgBefore);
  });
});
