import type { Database } from '@ansvar/mcp-sqlite';
import { clampLimit, escapeFTS5Query, normalizeStringArray } from './common.js';

export interface SearchHealthRegulationInput {
  query: string;
  sources?: string[];
  authorities?: string[];
  instrument_types?: string[];
  limit?: number;
}

export interface RegulationSearchResult {
  source: string;
  item_id: string;
  title: string | null;
  parent: string | null;
  source_name: string;
  authority: string | null;
  instrument_type: string | null;
  category: string | null;
  source_url: string | null;
  snippet: string;
  relevance: number;
}

export interface SearchMedicalDeviceRequirementsInput {
  query: string;
  sources?: string[];
  limit?: number;
}

interface SearchOptions {
  medicalDeviceOnly: boolean;
}

const SNIPPET_TOKEN_COUNT = 28;

export async function searchHealthRegulation(
  db: Database,
  input: SearchHealthRegulationInput
): Promise<RegulationSearchResult[]> {
  return runHealthSearch(db, input, { medicalDeviceOnly: false });
}

export async function searchMedicalDeviceRequirements(
  db: Database,
  input: SearchMedicalDeviceRequirementsInput
): Promise<RegulationSearchResult[]> {
  return runHealthSearch(
    db,
    {
      ...input,
      instrument_types: ['guideline', 'standard'],
    },
    { medicalDeviceOnly: true }
  );
}

async function runHealthSearch(
  db: Database,
  input: SearchHealthRegulationInput,
  options: SearchOptions
): Promise<RegulationSearchResult[]> {
  if (!input.query || input.query.trim().length === 0) {
    return [];
  }

  const rawQuery = input.query.trim();
  const safeQuery = escapeFTS5Query(rawQuery);
  const limit = clampLimit(input.limit);

  const sources = normalizeStringArray(input.sources);
  const authorities = normalizeStringArray(input.authorities);
  const instrumentTypes = normalizeStringArray(input.instrument_types);

  const buildSql = (): string => {
    let sql = `
    SELECT
      i.source,
      i.item_id,
      i.title,
      i.parent,
      s.full_name as source_name,
      s.authority,
      s.instrument_type,
      s.category,
      s.source_url,
      snippet(items_fts, 3, '>>>', '<<<', '...', ${SNIPPET_TOKEN_COUNT}) as snippet,
      bm25(items_fts) as relevance
    FROM items_fts
    JOIN items i ON i.rowid = items_fts.rowid
    JOIN sources s ON s.id = i.source
    WHERE items_fts MATCH ?
  `;

    if (sources.length > 0) {
      sql += ` AND i.source IN (${sources.map(() => '?').join(', ')})`;
    }

    if (authorities.length > 0) {
      sql += ` AND s.authority IN (${authorities.map(() => '?').join(', ')})`;
    }

    if (instrumentTypes.length > 0) {
      sql += ` AND s.instrument_type IN (${instrumentTypes.map(() => '?').join(', ')})`;
    }

    if (options.medicalDeviceOnly) {
      sql += ` AND (
      s.category = 'medical-devices'
      OR i.source IN ('IMDRF_N_SERIES', 'ICH_GUIDELINES')
      OR i.tags LIKE '%medical-device%'
      OR i.tags LIKE '%cybersecurity%'
    )`;
    }

    sql += ' ORDER BY relevance LIMIT ?';
    return sql;
  };

  const sql = buildSql();
  const runMatch = (matchQuery: string): RegulationSearchResult[] => {
    const params: Array<string | number> = [matchQuery];

    if (sources.length > 0) {
      params.push(...sources);
    }
    if (authorities.length > 0) {
      params.push(...authorities);
    }
    if (instrumentTypes.length > 0) {
      params.push(...instrumentTypes);
    }

    params.push(limit);
    return db.prepare(sql).all(...params) as RegulationSearchResult[];
  };

  const directResults = runMatch(safeQuery);
  if (directResults.length > 0) {
    return directResults;
  }

  const fallbackQuery = buildFallbackTokenQuery(rawQuery);
  if (!fallbackQuery) {
    return directResults;
  }

  return runMatch(fallbackQuery);
}

function buildFallbackTokenQuery(rawQuery: string): string | null {
  const tokens = rawQuery
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3)
    .slice(0, 8)
    .map((token) => escapeFTS5Query(token));

  if (tokens.length < 2) {
    return null;
  }

  return tokens.join(' OR ');
}
