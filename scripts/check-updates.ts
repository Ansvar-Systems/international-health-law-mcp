#!/usr/bin/env tsx
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

interface SourceFreshnessRow {
  source: string;
  full_name: string;
  authority: string | null;
  update_frequency: string | null;
  last_checked: string | null;
  last_updated: string | null;
  items_expected: number | null;
  items_parsed: number | null;
  quality_status: string | null;
}

function resolveDbPath(): string {
  if (process.env.INTERNATIONAL_HEALTH_LAW_DB_PATH) {
    return path.resolve(process.env.INTERNATIONAL_HEALTH_LAW_DB_PATH);
  }

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(scriptDir, '..', 'data', 'database.db');
}

function toAgeDays(dateValue: string | null): number | null {
  if (!dateValue) {
    return null;
  }

  const timestamp = Date.parse(dateValue);
  if (Number.isNaN(timestamp)) {
    return null;
  }

  const now = Date.now();
  const ageMs = now - timestamp;
  return Math.max(0, Math.floor(ageMs / (1000 * 60 * 60 * 24)));
}

function computeStatus(row: SourceFreshnessRow): 'ok' | 'warning' | 'stale' | 'unknown' {
  if (!row.last_checked && !row.last_updated) {
    return 'unknown';
  }

  const ageDays = toAgeDays(row.last_checked ?? row.last_updated);

  if (row.quality_status === 'incomplete') {
    return 'stale';
  }

  if (ageDays === null) {
    return 'unknown';
  }

  if (ageDays > 120) {
    return 'stale';
  }

  if (ageDays > 45) {
    return 'warning';
  }

  if (
    typeof row.items_expected === 'number' &&
    typeof row.items_parsed === 'number' &&
    row.items_parsed < row.items_expected
  ) {
    return 'warning';
  }

  return 'ok';
}

function main(): void {
  const dbPath = resolveDbPath();
  const db = new Database(dbPath, { readonly: true });

  const rows = db
    .prepare(
      `
      SELECT
        r.source,
        s.full_name,
        s.authority,
        r.update_frequency,
        r.last_checked,
        r.last_updated,
        r.items_expected,
        r.items_parsed,
        r.quality_status
      FROM source_registry r
      JOIN sources s ON s.id = r.source
      ORDER BY r.source
    `
    )
    .all() as SourceFreshnessRow[];

  db.close();

  if (rows.length === 0) {
    console.log('No sources found in source_registry.');
    return;
  }

  const counts = {
    ok: 0,
    warning: 0,
    stale: 0,
    unknown: 0,
  };

  console.log(`Data freshness report (${new Date().toISOString().slice(0, 10)})`);

  for (const row of rows) {
    const status = computeStatus(row);
    counts[status] += 1;
    const ageDays = toAgeDays(row.last_checked ?? row.last_updated);
    const ageLabel = ageDays === null ? 'n/a' : `${ageDays}d`;
    console.log(
      [
        `${status.toUpperCase().padEnd(7)}`,
        row.source.padEnd(20),
        `age=${ageLabel.padEnd(5)}`,
        `quality=${(row.quality_status ?? 'unknown').padEnd(10)}`,
        `expected=${String(row.items_expected ?? 'n/a').padEnd(4)}`,
        `parsed=${String(row.items_parsed ?? 'n/a').padEnd(4)}`,
        `freq=${row.update_frequency ?? 'n/a'}`,
      ].join('  ')
    );
  }

  console.log('');
  console.log(`Summary: ok=${counts.ok}, warning=${counts.warning}, stale=${counts.stale}, unknown=${counts.unknown}`);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`check-updates failed: ${message}`);
  process.exit(1);
}
