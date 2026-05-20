import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import zlib from 'node:zlib';

const mode = process.argv[2] ?? 'js-enabled';
const root = path.resolve('src/test/visual-baselines');
const phpRoot = path.join(root, 'php', mode);
const astroRoot = path.join(root, 'astro', mode);
const reportRoot = path.resolve('src/test/reports');
const reportPath = path.join(reportRoot, `baseline-compare-${mode}.json`);
const inflate = promisify(zlib.inflate);
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const screenshotThresholds = [
  { pattern: /(?:^|\\)(?:aboutus|cookies|business-cooperation|legal__privacy-policy|legal__network-service-protocol)(?:\\|$)/, maxDiffRatio: 0.005 },
  { pattern: /(?:^|\\)(?:support|status)(?:\\|$)/, maxDiffRatio: 1 },
];

function isRedirectArtifact(relativePath) {
  return /(?:^|\\)(?:support|status)(?:\\|$)/.test(relativePath);
}

function stripHtmlComments(content) {
  return content.replace(/<!--[\s\S]*?-->/g, '');
}

function normalizeHtml(content) {
  return stripHtmlComments(content)
    .replace(/\s+/g, ' ')
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
    stripHtmlComments(content)
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function normalizeHtmlLang(value) {
  const aliases = {
    en: 'en',
    'en-US': 'en',
    zh: 'zh-CN',
    'zh-CN': 'zh-CN',
    'zh-HK': 'zh-HK',
    ja: 'ja-JP',
    'ja-JP': 'ja-JP',
    'hu-MA': 'zh-x-mars',
    'zh-x-mars': 'zh-x-mars',
  };

  return aliases[value] ?? value;
}

function extractMetadata(content) {
  const contentWithoutComments = stripHtmlComments(content);
  const alternateMatches = [...contentWithoutComments.matchAll(/<link\b[^>]*rel=["']alternate["'][^>]*>/gi)];
  const alternates = alternateMatches
    .map((match) => ({
      hreflang: extractAttr(match[0], 'hreflang'),
      href: extractAttr(match[0], 'href'),
    }))
    .filter((alternate) => alternate.hreflang || alternate.href)
    .sort((a, b) => `${a.hreflang}:${a.href}`.localeCompare(`${b.hreflang}:${b.href}`));

  return {
    title: extractFirst(contentWithoutComments, /<title>([\s\S]*?)<\/title>/i),
    description: extractFirst(contentWithoutComments, /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i),
    htmlLang: extractFirst(contentWithoutComments, /<html\b[^>]*lang=["']([^"']*)["'][^>]*>/i),
    canonical: extractFirst(contentWithoutComments, /<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i),
    alternates,
    headings: [...contentWithoutComments.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map((match) =>
      normalizeText(match[1]),
    ),
    bodyText: normalizeText(contentWithoutComments.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? contentWithoutComments),
  };
}

function compareHtml(phpRaw, astroRaw) {
  const phpMetadata = extractMetadata(phpRaw);
  const astroMetadata = extractMetadata(astroRaw);
  const fieldComparisons = {
    title: phpMetadata.title === astroMetadata.title,
    description: phpMetadata.description === astroMetadata.description,
    htmlLang: normalizeHtmlLang(phpMetadata.htmlLang) === normalizeHtmlLang(astroMetadata.htmlLang),
  };
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
      normalizedHtmlLang: normalizeHtmlLang(phpMetadata.htmlLang),
      canonical: phpMetadata.canonical,
      alternates: phpMetadata.alternates,
      headings: phpMetadata.headings,
      bodyHash: hashBuffer(Buffer.from(phpMetadata.bodyText)),
    },
    astro: {
      title: astroMetadata.title,
      description: astroMetadata.description,
      htmlLang: astroMetadata.htmlLang,
      normalizedHtmlLang: normalizeHtmlLang(astroMetadata.htmlLang),
      canonical: astroMetadata.canonical,
      alternates: astroMetadata.alternates,
      headings: astroMetadata.headings,
      bodyHash: hashBuffer(Buffer.from(astroMetadata.bodyText)),
    },
  };
}

function paethPredictor(left, above, upperLeft) {
  const estimate = left + above - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const aboveDistance = Math.abs(estimate - above);
  const upperLeftDistance = Math.abs(estimate - upperLeft);

  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) {
    return left;
  }
  if (aboveDistance <= upperLeftDistance) {
    return above;
  }
  return upperLeft;
}

async function decodePng(buffer) {
  if (!buffer.subarray(0, 8).equals(pngSignature)) {
    throw new Error('Unsupported image format: expected PNG');
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const chunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const data = buffer.subarray(dataStart, dataEnd);

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      const bitDepth = data[8];
      colorType = data[9];
      const interlace = data[12];
      if (bitDepth !== 8 || interlace !== 0 || ![2, 6].includes(colorType)) {
        throw new Error(`Unsupported PNG format: bitDepth=${bitDepth}, colorType=${colorType}, interlace=${interlace}`);
      }
    } else if (type === 'IDAT') {
      chunks.push(data);
    } else if (type === 'IEND') {
      break;
    }

    offset = dataEnd + 4;
  }

  const channels = colorType === 6 ? 4 : 3;
  const bytesPerPixel = channels;
  const stride = width * channels;
  const inflated = await inflate(Buffer.concat(chunks));
  const pixels = Buffer.alloc(width * height * 4);
  let readOffset = 0;
  let writeOffset = 0;
  let previous = Buffer.alloc(stride);

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[readOffset];
    readOffset += 1;
    const current = Buffer.from(inflated.subarray(readOffset, readOffset + stride));
    readOffset += stride;

    for (let index = 0; index < stride; index += 1) {
      const left = index >= bytesPerPixel ? current[index - bytesPerPixel] : 0;
      const above = previous[index] ?? 0;
      const upperLeft = index >= bytesPerPixel ? previous[index - bytesPerPixel] : 0;

      if (filter === 1) {
        current[index] = (current[index] + left) & 0xff;
      } else if (filter === 2) {
        current[index] = (current[index] + above) & 0xff;
      } else if (filter === 3) {
        current[index] = (current[index] + Math.floor((left + above) / 2)) & 0xff;
      } else if (filter === 4) {
        current[index] = (current[index] + paethPredictor(left, above, upperLeft)) & 0xff;
      } else if (filter !== 0) {
        throw new Error(`Unsupported PNG filter: ${filter}`);
      }
    }

    for (let x = 0; x < width; x += 1) {
      const source = x * channels;
      pixels[writeOffset] = current[source];
      pixels[writeOffset + 1] = current[source + 1];
      pixels[writeOffset + 2] = current[source + 2];
      pixels[writeOffset + 3] = channels === 4 ? current[source + 3] : 255;
      writeOffset += 4;
    }

    previous = current;
  }

  return { width, height, pixels };
}

function maxDiffRatioForPath(relativePath) {
  return screenshotThresholds.find(({ pattern }) => pattern.test(relativePath))?.maxDiffRatio ?? 0.01;
}

async function comparePng(relativePath, phpBuffer, astroBuffer) {
  const [phpImage, astroImage] = await Promise.all([decodePng(phpBuffer), decodePng(astroBuffer)]);
  if (phpImage.width !== astroImage.width || phpImage.height !== astroImage.height) {
    return {
      dimensionsEqual: false,
      diffRatio: 1,
      maxDiffRatio: maxDiffRatioForPath(relativePath),
    };
  }

  let differentPixels = 0;
  const totalPixels = phpImage.width * phpImage.height;

  for (let index = 0; index < phpImage.pixels.length; index += 4) {
    const red = Math.abs(phpImage.pixels[index] - astroImage.pixels[index]);
    const green = Math.abs(phpImage.pixels[index + 1] - astroImage.pixels[index + 1]);
    const blue = Math.abs(phpImage.pixels[index + 2] - astroImage.pixels[index + 2]);
    const alpha = Math.abs(phpImage.pixels[index + 3] - astroImage.pixels[index + 3]);
    if (red + green + blue + alpha > 24) {
      differentPixels += 1;
    }
  }

  return {
    dimensionsEqual: true,
    diffRatio: differentPixels / totalPixels,
    maxDiffRatio: maxDiffRatioForPath(relativePath),
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
  if (isRedirectArtifact(relativePath)) {
    return {
      path: relativePath,
      type: 'skipped',
      equal: true,
      reason: 'Redirect page reaches an external dynamic target or uses a static jump page; screenshot parity is not required.',
    };
  }

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
  const extType = ext === '.png' ? 'png' : 'binary';

  if (ext === '.png') {
    const visual = await comparePng(relativePath, phpBuffer, astroBuffer);
    return {
      path: relativePath,
      type: 'png',
      equal: visual.dimensionsEqual && visual.diffRatio <= visual.maxDiffRatio,
      phpHash,
      astroHash,
      visual,
    };
  }

  return {
    path: relativePath,
    type: extType,
    equal: phpHash === astroHash,
    phpHash,
    astroHash,
  };
}

async function main() {
  const phpFiles = await listFiles(phpRoot);
  const comparisons = await Promise.all(phpFiles.map(compareOne));

  const missingInAstro = comparisons.filter((item) => item.type === 'missing-in-astro');
  const skipped = comparisons.filter((item) => item.type === 'skipped');
  const mismatches = comparisons.filter((item) => item.type !== 'missing-in-astro' && item.type !== 'skipped' && !item.equal);
  const matches = comparisons.filter((item) => item.equal);

  const report = {
    mode,
    generatedAt: new Date().toISOString(),
    totals: {
      phpFiles: phpFiles.length,
      matched: matches.length,
      mismatched: mismatches.length,
      missingInAstro: missingInAstro.length,
      skipped: skipped.length,
    },
    mismatches,
    missingInAstro,
    skipped,
  };

  await fs.mkdir(reportRoot, { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`mode=${mode}`);
  console.log(`phpFiles=${report.totals.phpFiles}`);
  console.log(`matched=${report.totals.matched}`);
  console.log(`mismatched=${report.totals.mismatched}`);
  console.log(`missingInAstro=${report.totals.missingInAstro}`);
  console.log(`skipped=${report.totals.skipped}`);
  console.log(`report=${reportPath}`);
}

await main();
