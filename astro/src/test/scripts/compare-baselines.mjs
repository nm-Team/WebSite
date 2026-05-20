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
    return {
      path: relativePath,
      type: 'html',
      equal: phpNormalized === astroNormalized,
      phpHash: hashBuffer(Buffer.from(phpNormalized)),
      astroHash: hashBuffer(Buffer.from(astroNormalized)),
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
