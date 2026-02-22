import type { Database } from 'better-sqlite3';
import { daysSince, toIsoDate } from './common.js';

export interface CheckDataFreshnessInput {
  warn_after_days?: number;
  critical_after_days?: number;
  include_ok?: boolean;
}

export interface FreshnessEntry {
  source: string;
  full_name: string;
  authority: string | null;
  update_frequency: string | null;
  last_checked: string | null;
  last_updated: string | null;
  freshness_days: number | null;
  quality_status: string | null;
  items_expected: number | null;
  items_parsed: number | null;
  status: 'ok' | 'warning' | 'critical' | 'unknown';
  notes: string | null;
}

export interface CheckDataFreshnessResult {
  generated_on: string;
  thresholds: {
    warning_days: number;
    critical_days: number;
  };
  summary: {
    total_sources: number;
    ok: number;
    warning: number;
    critical: number;
    unknown: number;
  };
  sources: FreshnessEntry[];
}

interface FreshnessRow {
  source: string;
  full_name: string;
  authority: string | null;
  update_frequency: string | null;
  last_checked: string | null;
  last_updated: string | null;
  quality_status: string | null;
  items_expected: number | null;
  items_parsed: number | null;
  notes: string | null;
}

const DEFAULT_WARNING_DAYS = 45;
const DEFAULT_CRITICAL_DAYS = 120;

export async function checkDataFreshness(
  db: Database,
  input: CheckDataFreshnessInput
): Promise<CheckDataFreshnessResult> {
  const warningDays = normalizeThreshold(input.warn_after_days, DEFAULT_WARNING_DAYS);
  const criticalDays = Math.max(
    warningDays + 1,
    normalizeThreshold(input.critical_after_days, DEFAULT_CRITICAL_DAYS)
  );

  const includeOk = input.include_ok ?? true;

  if (!tableExists(db, 'source_registry')) {
    return {
      generated_on: toIsoDate(),
      thresholds: {
        warning_days: warningDays,
        critical_days: criticalDays,
      },
      summary: {
        total_sources: 0,
        ok: 0,
        warning: 0,
        critical: 0,
        unknown: 0,
      },
      sources: [],
    };
  }

  const rows = db
    .prepare(
      `
      SELECT
        s.id as source,
        s.full_name,
        s.authority,
        r.update_frequency,
        r.last_checked,
        r.last_updated,
        r.quality_status,
        r.items_expected,
        r.items_parsed,
        r.notes
      FROM source_registry r
      JOIN sources s ON s.id = r.source
      ORDER BY s.id
    `
    )
    .all() as FreshnessRow[];

  const entries = rows
    .map((row) => toFreshnessEntry(row, warningDays, criticalDays))
    .filter((row) => includeOk || row.status !== 'ok');

  const summary = {
    total_sources: entries.length,
    ok: 0,
    warning: 0,
    critical: 0,
    unknown: 0,
  };

  for (const entry of entries) {
    summary[entry.status] += 1;
  }

  return {
    generated_on: toIsoDate(),
    thresholds: {
      warning_days: warningDays,
      critical_days: criticalDays,
    },
    summary,
    sources: entries,
  };
}

function toFreshnessEntry(
  row: FreshnessRow,
  warningDays: number,
  criticalDays: number
): FreshnessEntry {
  const freshnessDays = daysSince(row.last_checked ?? row.last_updated);

  let status: FreshnessEntry['status'] = 'unknown';

  if (row.quality_status === 'incomplete') {
    status = 'critical';
  } else if (freshnessDays === null) {
    status = 'unknown';
  } else if (freshnessDays > criticalDays) {
    status = 'critical';
  } else if (
    freshnessDays > warningDays ||
    row.quality_status === 'review' ||
    (
      typeof row.items_expected === 'number' &&
      typeof row.items_parsed === 'number' &&
      row.items_parsed < row.items_expected
    )
  ) {
    status = 'warning';
  } else {
    status = 'ok';
  }

  return {
    source: row.source,
    full_name: row.full_name,
    authority: row.authority,
    update_frequency: row.update_frequency,
    last_checked: row.last_checked,
    last_updated: row.last_updated,
    freshness_days: freshnessDays,
    quality_status: row.quality_status,
    items_expected: row.items_expected,
    items_parsed: row.items_parsed,
    status,
    notes: row.notes,
  };
}

function normalizeThreshold(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  const rounded = Math.trunc(Number(value));
  return rounded < 1 ? fallback : rounded;
}

function tableExists(db: Database, tableName: string): boolean {
  const row = db
    .prepare(
      `SELECT 1 as present FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1`
    )
    .get(tableName) as { present: number } | undefined;

  return Boolean(row);
}
