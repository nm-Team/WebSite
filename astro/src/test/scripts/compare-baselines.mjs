import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const mode = process.argv[2] ?? 'js-enabled';
const root = path.resolve('src/test/visual-baselines');
const phpRoot = path.join(root, 'php', mode);
const astroRoot = path.join(root, 'astro', mode);
const reportRoot = path.resolve('src/test/reports');
const reportPath = path.join(reportRoot, `baseline-compare-${mode}.json`);

function normalizeHtml(content) {
  return content
    .replace(/\s+/g, ' ')
    .replace(/<!--.*?-->/g, '')
    .trim();
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractAttr(tag, name) {
  const match = tag.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'));
  return match?.[1] ?? '';
}

function extractFirst(content, pattern) {
  return decodeEntities(content.match(pattern)?.[1]?.trim() ?? '');
}

function normalizeText(content) {
  return decodeEntities(
    content
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function extractMetadata(content) {
  const alternateMatches = [...content.matchAll(/<link\b[^>]*rel=["']alternate["'][^>]*>/gi)];
  const alternates = alternateMatches
    .map((match) => ({
      hreflang: extractAttr(match[0], 'hreflang'),
      href: extractAttr(match[0], 'href'),
    }))
    .filter((alternate) => alternate.hreflang || alternate.href)
    .sort((a, b) => `${a.hreflang}:${a.href}`.localeCompare(`${b.hreflang}:${b.href}`));

  return {
    title: extractFirst(content, /<title>([\s\S]*?)<\/title>/i),
    description: extractFirst(content, /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i),
    htmlLang: extractFirst(content, /<html\b[^>]*lang=["']([^"']*)["'][^>]*>/i),
    canonical: extractFirst(content, /<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i),
    alternates,
    headings: [...content.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map((match) =>
      normalizeText(match[1]),
    ),
    bodyText: normalizeText(content.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? content),
  };
}

function compareHtml(phpRaw, astroRaw) {
  const phpMetadata = extractMetadata(phpRaw);
  const astroMetadata = extractMetadata(astroRaw);
  const metadataFields = ['title', 'description', 'htmlLang'];
  const fieldComparisons = Object.fromEntries(
    metadataFields.map((field) => [field, phpMetadata[field] === astroMetadata[field]]),
  );
  const phpHasCanonical = phpMetadata.canonical.length > 0;
  const phpHasAlternates = phpMetadata.alternates.length > 0;

  return {
    fields: {
      ...fieldComparisons,
      canonical: phpHasCanonical ? phpMetadata.canonical === astroMetadata.canonical : astroMetadata.canonical.length > 0,
      alternates: phpHasAlternates
        ? JSON.stringify(phpMetadata.alternates) === JSON.stringify(astroMetadata.alternates)
        : astroMetadata.alternates.length > 0,
      headings: JSON.stringify(phpMetadata.headings) === JSON.stringify(astroMetadata.headings),
      bodyContainsPrimaryHeading: astroMetadata.headings.every((heading) => phpMetadata.bodyText.includes(heading)),
    },
    php: {
      title: phpMetadata.title,
      description: phpMetadata.description,
      htmlLang: phpMetadata.htmlLang,
      canonical: phpMetadata.canonical,
      alternates: phpMetadata.alternates,
      headings: phpMetadata.headings,
      bodyHash: hashBuffer(Buffer.from(phpMetadata.bodyText)),
    },
    astro: {
      title: astroMetadata.title,
      description: astroMetadata.description,
      htmlLang: astroMetadata.htmlLang,
      canonical: astroMetadata.canonical,
      alternates: astroMetadata.alternates,
      headings: astroMetadata.headings,
      bodyHash: hashBuffer(Buffer.from(astroMetadata.bodyText)),
    },
  };
}

function hashBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function listFiles(baseDir) {
  const result = [];

  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(absolute);
      } else {
        result.push(path.relative(baseDir, absolute));
      }
    }
  }

  await walk(baseDir);
  return result.sort();
}

async function compareOne(relativePath) {
  const phpFile = path.join(phpRoot, relativePath);
  const astroFile = path.join(astroRoot, relativePath);

  let astroExists = true;
  try {
    await fs.access(astroFile);
  } catch {
    astroExists = false;
  }

  if (!astroExists) {
    return {
      path: relativePath,
      type: 'missing-in-astro',
      equal: false,
    };
  }

  const ext = path.extname(relativePath).toLowerCase();
  if (ext === '.html') {
    const [phpRaw, astroRaw] = await Promise.all([
      fs.readFile(phpFile, 'utf8'),
      fs.readFile(astroFile, 'utf8'),
    ]);
    const phpNormalized = normalizeHtml(phpRaw);
    const astroNormalized = normalizeHtml(astroRaw);
    const structured = compareHtml(phpRaw, astroRaw);
    return {
      path: relativePath,
      type: 'html',
      equal: Object.values(structured.fields).every(Boolean),
      phpHash: hashBuffer(Buffer.from(phpNormalized)),
      astroHash: hashBuffer(Buffer.from(astroNormalized)),
      structured,
    };
  }

  const [phpBuffer, astroBuffer] = await Promise.all([
    fs.readFile(phpFile),
    fs.readFile(astroFile),
  ]);

  const phpHash = hashBuffer(phpBuffer);
  const astroHash = hashBuffer(astroBuffer);

  return {
    path: relativePath,
    type: ext === '.png' ? 'png' : 'binary',
    equal: phpHash === astroHash,
    phpHash,
    astroHash,
  };
}

async function main() {
  const phpFiles = await listFiles(phpRoot);
  const comparisons = await Promise.all(phpFiles.map(compareOne));

  const missingInAstro = comparisons.filter((item) => item.type === 'missing-in-astro');
  const mismatches = comparisons.filter((item) => item.type !== 'missing-in-astro' && !item.equal);
  const matches = comparisons.filter((item) => item.equal);

  const report = {
    mode,
    generatedAt: new Date().toISOString(),
    totals: {
      phpFiles: phpFiles.length,
      matched: matches.length,
      mismatched: mismatches.length,
      missingInAstro: missingInAstro.length,
    },
    mismatches,
    missingInAstro,
  };

  await fs.mkdir(reportRoot, { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`mode=${mode}`);
  console.log(`phpFiles=${report.totals.phpFiles}`);
  console.log(`matched=${report.totals.matched}`);
  console.log(`mismatched=${report.totals.mismatched}`);
  console.log(`missingInAstro=${report.totals.missingInAstro}`);
  console.log(`report=${reportPath}`);
}

await main();
