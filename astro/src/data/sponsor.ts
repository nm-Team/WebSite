import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

export interface SponsorEntry {
  name: string;
  avatar: string;
  amount: string;
}

export interface OtherContributorEntry {
  name: string;
  avatar: string;
  contribution: string;
}

export interface SponsorData {
  update: string;
  sponsor: SponsorEntry[];
  other: OtherContributorEntry[];
}

const astroRoot = process.cwd().endsWith('astro') ? process.cwd() : resolve(process.cwd(), 'astro');
const sponsorPath = join(dirname(astroRoot), 'src', 'json', 'sponsor.json');

function assertObject(value: unknown, path: string): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${path} must be an object.`);
  }
}

function readString(source: Record<string, unknown>, key: string, path: string): string {
  const value = source[key];
  if (typeof value !== 'string') {
    throw new Error(`${path}.${key} must be a string.`);
  }
  return value;
}

function readArray<T>(source: Record<string, unknown>, key: string, path: string, mapper: (value: unknown, itemPath: string) => T): T[] {
  const value = source[key];
  if (!Array.isArray(value)) {
    throw new Error(`${path}.${key} must be an array.`);
  }
  return value.map((item, index) => mapper(item, `${path}.${key}[${index}]`));
}

export function getSponsorData(): SponsorData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(sponsorPath, 'utf8')) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse sponsor JSON at ${sponsorPath}: ${message}`);
  }

  assertObject(parsed, sponsorPath);
  return {
    update: readString(parsed, 'update', sponsorPath),
    sponsor: readArray(parsed, 'sponsor', sponsorPath, (item, path) => {
      assertObject(item, path);
      return {
        name: readString(item, 'name', path),
        avatar: readString(item, 'avatar', path),
        amount: readString(item, 'amount', path),
      };
    }),
    other: readArray(parsed, 'other', sponsorPath, (item, path) => {
      assertObject(item, path);
      return {
        name: readString(item, 'name', path),
        avatar: readString(item, 'avatar', path),
        contribution: readString(item, 'contribution', path),
      };
    }),
  };
}
