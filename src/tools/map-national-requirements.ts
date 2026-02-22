import type { Database } from 'better-sqlite3';
import { clampLimit, parseJsonField } from './common.js';

export interface MapToNationalRequirementsInput {
  source?: string;
  provision_id?: string;
  framework?: string;
  country?: string;
  limit?: number;
}

export interface NationalRequirementMapping {
  framework: string;
  control_id: string;
  control_name: string | null;
  target_source: string;
  target_items: string[];
  coverage: 'full' | 'partial' | 'related' | null;
  notes: string | null;
  country: string | null;
  jurisdiction: string | null;
}

export interface NationalRequirementsResult {
  total_mappings: number;
  filters: {
    source: string | null;
    provision_id: string | null;
    framework: string | null;
    country: string | null;
  };
  mappings: NationalRequirementMapping[];
}

interface MappingRow {
  framework: string;
  control_id: string;
  control_name: string | null;
  target_source: string;
  target_items: string;
  coverage: 'full' | 'partial' | 'related' | null;
  notes: string | null;
  country: string | null;
  jurisdiction: string | null;
}

export async function mapToNationalRequirements(
  db: Database,
  input: MapToNationalRequirementsInput
): Promise<NationalRequirementsResult> {
  const limit = clampLimit(input.limit, 25);

  const hasCountryColumn = tableHasColumn(db, 'mappings', 'country');
  const hasJurisdictionColumn = tableHasColumn(db, 'mappings', 'jurisdiction');

  let sql = `
    SELECT
      framework,
      control_id,
      control_name,
      target_source,
      target_items,
      coverage,
      notes,
      ${hasCountryColumn ? 'country' : 'NULL as country'},
      ${hasJurisdictionColumn ? 'jurisdiction' : 'NULL as jurisdiction'}
    FROM mappings
    WHERE 1 = 1
  `;

  const params: Array<string | number> = [];

  const source = input.source?.trim();
  if (source) {
    sql += ' AND target_source = ?';
    params.push(source);
  }

  const framework = input.framework?.trim();
  if (framework) {
    sql += ' AND framework = ?';
    params.push(framework);
  }

  const country = input.country?.trim();
  if (country) {
    if (hasCountryColumn) {
      sql += ' AND country = ?';
      params.push(country);
    } else {
      return {
        total_mappings: 0,
        filters: {
          source: source ?? null,
          provision_id: input.provision_id?.trim() ?? null,
          framework: framework ?? null,
          country,
        },
        mappings: [],
      };
    }
  }

  const provisionId = input.provision_id?.trim();
  if (provisionId) {
    sql += ' AND target_items LIKE ?';
    params.push(`%"${provisionId}"%`);
  }

  sql += ' ORDER BY framework, control_id LIMIT ?';
  params.push(limit);

  const rows = db.prepare(sql).all(...params) as MappingRow[];

  const mappings = rows.map((row) => ({
    framework: row.framework,
    control_id: row.control_id,
    control_name: row.control_name,
    target_source: row.target_source,
    target_items: parseJsonField<string[]>(row.target_items) ?? [],
    coverage: row.coverage,
    notes: row.notes,
    country: row.country,
    jurisdiction: row.jurisdiction,
  }));

  return {
    total_mappings: mappings.length,
    filters: {
      source: source ?? null,
      provision_id: provisionId ?? null,
      framework: framework ?? null,
      country: country ?? null,
    },
    mappings,
  };
}

function tableHasColumn(db: Database, table: string, column: string): boolean {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return rows.some((row) => row.name === column);
}
