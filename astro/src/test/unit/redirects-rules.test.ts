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

type ParsedRule = {
  source: string;
  destination: string;
  status: number;
};

function parseRule(rule: string): ParsedRule {
  const [source = '', destination = '', status = '302'] = rule.split(/\s+/);
  return {
    source,
    destination,
    status: Number(status),
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sourceToRegExp(source: string): RegExp {
  let pattern = '^';
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (char === '*') {
      pattern += '(?<splat>.*)';
      continue;
    }

    if (char === ':' && /[A-Za-z]/.test(source[index + 1] ?? '')) {
      let end = index + 2;
      while (end < source.length && /\w/.test(source[end])) {
        end += 1;
      }
      const name = source.slice(index + 1, end);
      pattern += `(?<${name}>[^/]+)`;
      index = end - 1;
      continue;
    }

    pattern += escapeRegExp(char);
  }

  return new RegExp(`${pattern}$`);
}

function applyDestination(destination: string, groups: Record<string, string>, search: string): string {
  const resolved = destination.replace(/:([A-Za-z]\w*)/g, (_, name: string) => groups[name] ?? '');
  return resolved.includes('?') ? resolved : `${resolved}${search}`;
}

function resolveRedirect(inputPath: string): string | undefined {
  const url = new URL(inputPath, 'https://example.test');
  for (const rule of loadRedirectRules().map(parseRule)) {
    const match = sourceToRegExp(rule.source).exec(url.pathname);
    if (!match) {
      continue;
    }

    return applyDestination(rule.destination, match.groups ?? {}, url.search);
  }

  return undefined;
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
    expect(hasRule(rules, '/:lang/*.php', '/:lang/:splat/', 301)).toBe(true);
    expect(hasRule(rules, '/*.php', '/:splat/', 301)).toBe(true);
  });

  it('does not emit literal splat characters in redirect destinations', () => {
    const rules = loadRedirectRules();

    for (const rule of rules) {
      const [, destination] = rule.split(/\s+/);
      expect(destination).not.toContain('*');
    }
  });

  it('resolves legacy php URLs without leaking splat syntax into the target', () => {
    const cases = [
      ['/aboutus.php?lan=zh_CN', '/aboutus/?lan=zh_CN'],
      ['/zh-CN/aboutus.php', '/zh-CN/aboutus/'],
      ['/cookies.php?lan=zh_CN', '/cookies/?lan=zh_CN'],
      ['/legal/privacy-policy.php?lan=zh_CN', '/legal/privacy-policy/?lan=zh_CN'],
      ['/products/overview.php?product=nmBot-Telegram', '/products/overview/?product=nmBot-Telegram'],
      [
        '/products/template/nmBot-Telegram.php?lan=zh_CN',
        '/products/overview/nmBot-Telegram/?lan=zh_CN',
      ],
      ['/join/forum.php?jobType=dev', '/questionnaire-ended/?jobType=dev'],
      ['/unknown/nested.php?x=1', '/unknown/nested/?x=1'],
    ] as const;

    for (const [from, to] of cases) {
      expect(resolveRedirect(from)).toBe(to);
    }
  });

  it('keeps explicit exception rules before generic fallback', () => {
    const rules = loadRedirectRules();
    const genericIndex = rules.indexOf('/:lang/*.php /:lang/:splat/ 301');
    const businessExceptionIndex = rules.indexOf('/:lang/business_cooperation.php /:lang/business-cooperation/ 301');
    const externalExceptionIndex = rules.indexOf('/:lang/status.php https://status.nmteam.xyz 302');
    const productTemplateIndex = rules.indexOf(
      '/:lang/products/template/nmBot-Telegram.php /:lang/products/overview/nmBot-Telegram/ 301',
    );
    const joinForumIndex = rules.indexOf('/:lang/join/forum.php /:lang/questionnaire-ended/ 301');

    expect(genericIndex).toBeGreaterThan(-1);
    expect(businessExceptionIndex).toBeGreaterThan(-1);
    expect(externalExceptionIndex).toBeGreaterThan(-1);
    expect(productTemplateIndex).toBeGreaterThan(-1);
    expect(joinForumIndex).toBeGreaterThan(-1);
    expect(businessExceptionIndex).toBeLessThan(genericIndex);
    expect(externalExceptionIndex).toBeLessThan(genericIndex);
    expect(productTemplateIndex).toBeLessThan(genericIndex);
    expect(joinForumIndex).toBeLessThan(genericIndex);
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

      if (source === '/join/forum.php') {
        expect(hasRule(rules, source, '/questionnaire-ended/', 301)).toBe(true);
        expect(hasRule(rules, `/:lang${source}`, '/:lang/questionnaire-ended/', 301)).toBe(true);
        continue;
      }

      if (source === '/blackboard/questionnaire/index.php') {
        expect(hasRule(rules, source, '/questionnaire-ended/', 301)).toBe(true);
        expect(hasRule(rules, `/:lang${source}`, '/:lang/questionnaire-ended/', 301)).toBe(true);
        continue;
      }

      if (source === '/products/template/nmBot-Telegram.php') {
        expect(hasRule(rules, source, '/products/overview/nmBot-Telegram/', 301)).toBe(true);
        expect(hasRule(rules, `/:lang${source}`, '/:lang/products/overview/nmBot-Telegram/', 301)).toBe(true);
        continue;
      }

      if (source === '/products/overview.php') {
        expect(hasRule(rules, source, '/products/overview/', 301)).toBe(true);
        expect(hasRule(rules, `/:lang${source}`, '/:lang/products/overview/', 301)).toBe(true);
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

      expect(hasRule(rules, source, expectedRoot, 301)).toBe(true);
      expect(hasRule(rules, `/:lang${source}`, expectedPrefixed, 301)).toBe(true);
    }
  });
});
