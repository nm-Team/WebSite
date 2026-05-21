import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { routeManifest } from '@/i18n/routes';

function loadRedirectRules(): string[] {
  const content = readFileSync(resolve(process.cwd(), 'public/_redirects'), 'utf-8');
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

function hasRule(rules: string[], source: string, target: string, status: number): boolean {
  return rules.includes(`${source} ${target} ${status}`);
}

function toExpectedRootPathFromPhp(sourcePhpPath: string): string {
  if (sourcePhpPath === '/index.php') {
    return '/';
  }
  if (sourcePhpPath === '/business_cooperation.php') {
    return '/business-cooperation/';
  }
  if (sourcePhpPath.endsWith('/index.php')) {
    return `${sourcePhpPath.slice(0, -'index.php'.length)}`;
  }
  return `${sourcePhpPath.slice(0, -'.php'.length)}/`;
}

describe('_redirects rules', () => {
  it('defines generic php fallbacks', () => {
    const rules = loadRedirectRules();
    expect(hasRule(rules, '/:lang/:path*.php', '/:lang/:path*/', 301)).toBe(true);
    expect(hasRule(rules, '/:path*.php', '/:path*/', 301)).toBe(true);
  });

  it('keeps explicit exception rules before generic fallback', () => {
    const rules = loadRedirectRules();
    const genericIndex = rules.indexOf('/:lang/:path*.php /:lang/:path*/ 301');
    const businessExceptionIndex = rules.indexOf('/:lang/business_cooperation.php /:lang/business-cooperation/ 301');
    const externalExceptionIndex = rules.indexOf('/:lang/status.php https://status.nmteam.xyz 302');

    expect(genericIndex).toBeGreaterThan(-1);
    expect(businessExceptionIndex).toBeGreaterThan(-1);
    expect(externalExceptionIndex).toBeGreaterThan(-1);
    expect(businessExceptionIndex).toBeLessThan(genericIndex);
    expect(externalExceptionIndex).toBeLessThan(genericIndex);
  });

  it('covers all legacy sourcePhpPath routes for root and locale-prefixed requests', () => {
    const rules = loadRedirectRules();
    const rootSources = new Set(routeManifest.map((route) => route.sourcePhpPath));

    for (const source of rootSources) {
      if (source === '/support/index.php') {
        expect(hasRule(rules, source, 'https://support.nmteam.xyz', 302)).toBe(true);
        expect(hasRule(rules, `/:lang${source}`, 'https://support.nmteam.xyz', 302)).toBe(true);
        continue;
      }

      if (source === '/status.php') {
        expect(hasRule(rules, source, 'https://status.nmteam.xyz', 302)).toBe(true);
        expect(hasRule(rules, `/:lang${source}`, 'https://status.nmteam.xyz', 302)).toBe(true);
        continue;
      }

      if (source === '/business_cooperation.php') {
        expect(hasRule(rules, source, '/business-cooperation/', 301)).toBe(true);
        expect(hasRule(rules, `/:lang${source}`, '/:lang/business-cooperation/', 301)).toBe(true);
        continue;
      }

      if (source === '/blackboard/questionnaire/index.php') {
        expect(hasRule(rules, source, '/questionnaire-ended/', 301)).toBe(true);
        expect(hasRule(rules, `/:lang${source}`, '/:lang/questionnaire-ended/', 301)).toBe(true);
        continue;
      }

      const expectedRoot = toExpectedRootPathFromPhp(source);
      const expectedPrefixed = expectedRoot === '/' ? '/:lang/' : `/:lang${expectedRoot}`;
      const isDirectoryIndex = source.endsWith('/index.php');

      if (isDirectoryIndex) {
        expect(hasRule(rules, source, expectedRoot, 301)).toBe(true);
        expect(hasRule(rules, `/:lang${source}`, expectedPrefixed, 301)).toBe(true);
        continue;
      }

      expect(hasRule(rules, '/:path*.php', '/:path*/', 301)).toBe(true);
      expect(hasRule(rules, '/:lang/:path*.php', '/:lang/:path*/', 301)).toBe(true);
    }
  });
});
