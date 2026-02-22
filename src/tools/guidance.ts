import type { Database } from 'better-sqlite3';
import { clampLimit, escapeFTS5Query, parseJsonField } from './common.js';

export interface GuidanceInput {
  guideline_id?: string;
  query?: string;
  limit?: number;
  include_full_text?: boolean;
}

export interface GuidanceRecord {
  source: string;
  source_name: string;
  item_id: string;
  title: string | null;
  parent: string | null;
  snippet: string | null;
  text: string | null;
  tags: string[];
  metadata: Record<string, unknown> | null;
  relevance: number | null;
  citation: string;
}

export interface GuidanceResult {
  source: string;
  source_name: string;
  result_count: number;
  guidelines: GuidanceRecord[];
}

interface GuidanceRow {
  source: string;
  source_name: string;
  item_id: string;
  title: string | null;
  parent: string | null;
  text: string;
  tags: string | null;
  metadata: string | null;
  snippet: string | null;
  relevance: number | null;
}

const ICH_SOURCE_ID = 'ICH_GUIDELINES';
const IMDRF_SOURCE_ID = 'IMDRF_N_SERIES';

export async function getIchGuideline(
  db: Database,
  input: GuidanceInput
): Promise<GuidanceResult> {
  return getGuidanceBySource(db, ICH_SOURCE_ID, input);
}

export async function getImdrfGuidance(
  db: Database,
  input: GuidanceInput
): Promise<GuidanceResult> {
  return getGuidanceBySource(db, IMDRF_SOURCE_ID, input);
}

async function getGuidanceBySource(
  db: Database,
  sourceId: string,
  input: GuidanceInput
): Promise<GuidanceResult> {
  const sourceName = resolveSourceName(db, sourceId);
  const limit = clampLimit(input.limit, 5);

  const rows = input.guideline_id && input.guideline_id.trim().length > 0
    ? searchByGuidelineId(db, sourceId, input.guideline_id.trim(), limit)
    : input.query && input.query.trim().length > 0
      ? searchByQuery(db, sourceId, input.query.trim(), limit)
      : listDefaultGuidance(db, sourceId, limit);

  const includeFullText = Boolean(input.include_full_text);

  const guidelines = rows.map((row) => {
    const tags = parseJsonField<string[]>(row.tags) ?? [];
    const metadata = parseJsonField<Record<string, unknown>>(row.metadata);

    return {
      source: row.source,
      source_name: row.source_name,
      item_id: row.item_id,
      title: row.title,
      parent: row.parent,
      snippet: row.snippet,
      text: includeFullText ? row.text : null,
      tags,
      metadata,
      relevance: row.relevance,
      citation: `${row.source} ${row.item_id}`,
    } satisfies GuidanceRecord;
  });

  return {
    source: sourceId,
    source_name: sourceName,
    result_count: guidelines.length,
    guidelines,
  };
}

function resolveSourceName(db: Database, sourceId: string): string {
  const row = db
    .prepare('SELECT full_name FROM sources WHERE id = ?')
    .get(sourceId) as { full_name: string } | undefined;

  return row?.full_name ?? sourceId;
}

function searchByGuidelineId(
  db: Database,
  sourceId: string,
  guidelineId: string,
  limit: number
): GuidanceRow[] {
  const exactMatches = db
    .prepare(
      `
      SELECT
        i.source,
        s.full_name as source_name,
        i.item_id,
        i.title,
        i.parent,
        i.text,
        i.tags,
        i.metadata,
        NULL as snippet,
        NULL as relevance
      FROM items i
      JOIN sources s ON s.id = i.source
      WHERE i.source = ?
        AND (i.item_id = ? OR i.item_id LIKE ? OR i.title LIKE ? COLLATE NOCASE)
      ORDER BY
        CASE
          WHEN i.item_id = ? THEN 0
          WHEN i.item_id LIKE ? THEN 1
          ELSE 2
        END,
        i.item_id
      LIMIT ?
    `
    )
    .all(
      sourceId,
      guidelineId,
      `${guidelineId}%`,
      `%${guidelineId}%`,
      guidelineId,
      `${guidelineId}%`,
      limit
    ) as GuidanceRow[];

  return exactMatches;
}

function searchByQuery(
  db: Database,
  sourceId: string,
  query: string,
  limit: number
): GuidanceRow[] {
  const safeQuery = escapeFTS5Query(query);

  return db
    .prepare(
      `
      SELECT
        i.source,
        s.full_name as source_name,
        i.item_id,
        i.title,
        i.parent,
        i.text,
        i.tags,
        i.metadata,
        snippet(items_fts, 3, '>>>', '<<<', '...', 24) as snippet,
        bm25(items_fts) as relevance
      FROM items_fts
      JOIN items i ON i.rowid = items_fts.rowid
      JOIN sources s ON s.id = i.source
      WHERE items_fts MATCH ?
        AND i.source = ?
      ORDER BY relevance
      LIMIT ?
    `
    )
    .all(safeQuery, sourceId, limit) as GuidanceRow[];
}

function listDefaultGuidance(db: Database, sourceId: string, limit: number): GuidanceRow[] {
  return db
    .prepare(
      `
      SELECT
        i.source,
        s.full_name as source_name,
        i.item_id,
        i.title,
        i.parent,
        i.text,
        i.tags,
        i.metadata,
        NULL as snippet,
        NULL as relevance
      FROM items i
      JOIN sources s ON s.id = i.source
      WHERE i.source = ?
      ORDER BY i.item_id
      LIMIT ?
    `
    )
    .all(sourceId, limit) as GuidanceRow[];
}
