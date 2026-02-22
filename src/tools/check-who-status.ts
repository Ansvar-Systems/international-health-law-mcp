import type { Database } from '@ansvar/mcp-sqlite';
import { daysSince } from './common.js';

export interface CheckWhoStatusInput {
  source?: string;
  include_non_who?: boolean;
}

export interface WhoStatusEntry {
  source: string;
  full_name: string;
  authority: string | null;
  source_url: string | null;
  official_id: string | null;
  official_version: string | null;
  last_updated: string | null;
  last_checked: string | null;
  quality_status: string | null;
  items_expected: number | null;
  items_parsed: number | null;
  freshness_days: number | null;
  status: 'current' | 'review_required' | 'stale' | 'unknown';
  notes: string | null;
}

export interface CheckWhoStatusResult {
  total_sources: number;
  status_counts: {
    current: number;
    review_required: number;
    stale: number;
    unknown: number;
  };
  sources: WhoStatusEntry[];
}

interface WhoStatusRow {
  source: string;
  full_name: string;
  authority: string | null;
  source_url: string | null;
  official_id: string | null;
  official_version: string | null;
  last_fetched: string | null;
  last_updated: string | null;
  last_checked: string | null;
  items_expected: number | null;
  items_parsed: number | null;
  quality_status: string | null;
  notes: string | null;
}

export async function checkWhoStatus(
  db: Database,
  input: CheckWhoStatusInput
): Promise<CheckWhoStatusResult> {
  if (!tableExists(db, 'source_registry')) {
    return {
      total_sources: 0,
      status_counts: {
        current: 0,
        review_required: 0,
        stale: 0,
        unknown: 0,
      },
      sources: [],
    };
  }

  const filterSource = input.source?.trim();
  const includeNonWho = Boolean(input.include_non_who);

  let sql = `
    SELECT
      s.id as source,
      s.full_name,
      s.authority,
      s.source_url,
      r.official_id,
      r.official_version,
      r.last_fetched,
      r.last_updated,
      r.last_checked,
      r.items_expected,
      r.items_parsed,
      r.quality_status,
      r.notes
    FROM sources s
    LEFT JOIN source_registry r ON r.source = s.id
    WHERE 1 = 1
  `;

  const params: Array<string> = [];

  if (!includeNonWho) {
    sql += `
      AND (
        s.authority LIKE '%World Health Organization%'
        OR s.id LIKE 'WHO_%'
      )
    `;
  }

  if (filterSource) {
    sql += ' AND s.id = ?';
    params.push(filterSource);
  }

  sql += ' ORDER BY s.id';

  const rows = db.prepare(sql).all(...params) as WhoStatusRow[];

  const sources = rows.map(toStatusEntry);

  const statusCounts = {
    current: 0,
    review_required: 0,
    stale: 0,
    unknown: 0,
  };

  for (const source of sources) {
    statusCounts[source.status] += 1;
  }

  return {
    total_sources: sources.length,
    status_counts: statusCounts,
    sources,
  };
}

function toStatusEntry(row: WhoStatusRow): WhoStatusEntry {
  const referenceDate = row.last_checked ?? row.last_fetched ?? row.last_updated;
  const freshnessDays = daysSince(referenceDate);

  let status: WhoStatusEntry['status'] = 'unknown';

  if (row.quality_status === 'incomplete') {
    status = 'stale';
  } else if (freshnessDays === null) {
    status = 'unknown';
  } else if (freshnessDays > 180) {
    status = 'stale';
  } else if (
    freshnessDays > 60 ||
    (
      typeof row.items_expected === 'number' &&
      typeof row.items_parsed === 'number' &&
      row.items_parsed < row.items_expected
    ) ||
    row.quality_status === 'review'
  ) {
    status = 'review_required';
  } else {
    status = 'current';
  }

  return {
    source: row.source,
    full_name: row.full_name,
    authority: row.authority,
    source_url: row.source_url,
    official_id: row.official_id,
    official_version: row.official_version,
    last_updated: row.last_updated,
    last_checked: row.last_checked,
    quality_status: row.quality_status,
    items_expected: row.items_expected,
    items_parsed: row.items_parsed,
    freshness_days: freshnessDays,
    status,
    notes: row.notes,
  };
}

function tableExists(db: Database, tableName: string): boolean {
  const row = db
    .prepare(
      `SELECT 1 as present FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1`
    )
    .get(tableName) as { present: number } | undefined;

  return Boolean(row);
}
