import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { runCapture } from './capture-baselines.mjs';

const astroCwd = process.cwd();
const repoCwd = path.resolve(astroCwd, '..');
const phpLogPath = path.join(astroCwd, 'php-baseline.log');
const astroLogPath = path.join(astroCwd, 'astro-preview.log');

function spawnWithLog(command, args, logPath, cwd) {
  const logStream = fs.createWriteStream(logPath, { flags: 'w' });
  const child = spawn(command, args, {
    cwd,
    shell: false,
    windowsHide: true,
  });

  child.stdout.on('data', (chunk) => logStream.write(chunk));
  child.stderr.on('data', (chunk) => logStream.write(chunk));

  child.on('close', (code) => {
    logStream.write(`\n[process-exit] code=${code}\n`);
    logStream.end();
  });

  return child;
}

async function waitForUrl(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) {
        return;
      }
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timeout waiting for ${url}`);
}

function killProcess(child) {
  if (!child || child.killed) {
    return;
  }

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }

  child.kill('SIGKILL');
}

async function main() {
  const mode = process.argv[2] ?? 'js-enabled';
  const php = spawnWithLog(
    'php',
    ['-S', '127.0.0.1:8080', 'astro/src/test/php-router.php'],
    phpLogPath,
    repoCwd,
  );
  const astro = spawnWithLog(
    'cmd.exe',
    ['/c', 'pnpm baseline:astro'],
    astroLogPath,
    astroCwd,
  );

  try {
    await waitForUrl('http://127.0.0.1:8080/?lan=en_US');
    await waitForUrl('http://127.0.0.1:4321/en/');

    console.log('Servers are ready. Starting capture...');
    await runCapture(mode);
  } finally {
    killProcess(php);
    killProcess(astro);
    process.exit(0);
  }
}

await main();
