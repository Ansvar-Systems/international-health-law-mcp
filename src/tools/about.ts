import type { Database } from '@ansvar/mcp-sqlite';

export interface AboutInput {
  include_sources?: boolean;
}

export interface AboutResult {
  name: string;
  package: string;
  version: string;
  mcp_name: string;
  description: string;
  domain: string;
  deployment_strategy: string;
  driver: string;
  stats: {
    sources: number;
    items: number;
    definitions: number;
    mappings: number;
  };
  tools: string[];
  sources?: Array<{
    id: string;
    full_name: string;
    authority: string | null;
    instrument_type: string | null;
    source_url: string | null;
  }>;
}

const TOOL_NAMES = [
  'search_health_regulation',
  'get_provision',
  'get_ich_guideline',
  'get_imdrf_guidance',
  'check_who_status',
  'map_to_national_requirements',
  'search_medical_device_requirements',
  'build_legal_stance',
  'list_sources',
  'about',
  'check_data_freshness',
];

export async function aboutServer(
  db: Database,
  input: AboutInput
): Promise<AboutResult> {
  const sources = countRows(db, 'sources');
  const items = countRows(db, 'items');
  const definitions = countRows(db, 'definitions');
  const mappings = countRows(db, 'mappings');

  const result: AboutResult = {
    name: 'International Health Law MCP',
    package: '@ansvar/international-health-law-mcp',
    version: '0.1.0',
    mcp_name: 'eu.ansvar/international-health-law',
    description:
      'MCP server for international health law and regulatory instruments across WHO, ICH, IMDRF, and Codex frameworks.',
    domain: 'International health regulation and medical-device guidance',
    deployment_strategy: 'Strategy A (Vercel)',
    driver: 'NetSecurity medical software provider',
    stats: {
      sources,
      items,
      definitions,
      mappings,
    },
    tools: TOOL_NAMES,
  };

  if (input.include_sources ?? true) {
    result.sources = db
      .prepare(
        `
        SELECT id, full_name, authority, instrument_type, source_url
        FROM sources
        ORDER BY id
      `
      )
      .all() as AboutResult['sources'];
  }

  return result;
}

function countRows(db: Database, tableName: string): number {
  const row = db
    .prepare(`SELECT COUNT(*) as count FROM ${tableName}`)
    .get() as { count: number };

  return row.count;
}
