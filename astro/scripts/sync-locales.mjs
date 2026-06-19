import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '..');
const sourceDir = path.join(projectRoot, 'src', 'data', 'locales');
const outputDir = path.join(projectRoot, 'public', 'src', 'locales');

async function listJsonFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json')).map((entry) => entry.name);
}

async function syncLocales() {
  await mkdir(outputDir, { recursive: true });

  const files = await listJsonFiles(sourceDir);
  const copied = [];

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const outputPath = path.join(outputDir, file);
    const content = await readFile(sourcePath, 'utf8');
    await writeFile(outputPath, content, 'utf8');
    copied.push(file);
  }

  console.log(`[sync:locales] Synced ${copied.length} files from src/data/locales to public/src/locales.`);
}

syncLocales().catch((error) => {
  console.error('[sync:locales] Failed to sync locale files.');
  console.error(error);
  process.exitCode = 1;
});
