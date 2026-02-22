#!/usr/bin/env tsx
import { spawnSync } from 'node:child_process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

function main(): void {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const pythonScript = path.resolve(scriptDir, 'ingest_full_corpus.py');

  const result = spawnSync('python3', [pythonScript, ...process.argv.slice(2)], {
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    process.exit(result.status);
  }
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`ingest failed: ${message}`);
  process.exit(1);
}
