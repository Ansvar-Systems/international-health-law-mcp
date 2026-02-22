import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import Database from '@ansvar/mcp-sqlite';
import { join } from 'path';
import { existsSync, copyFileSync, rmSync, readFileSync } from 'fs';

import { listSources, type ListInput } from '../src/tools/list.js';
import {
  searchHealthRegulation,
  searchMedicalDeviceRequirements,
  type SearchHealthRegulationInput,
  type SearchMedicalDeviceRequirementsInput,
} from '../src/tools/search-health-regulation.js';
import { getProvision, type GetProvisionInput } from '../src/tools/get-provision.js';
import {
  getIchGuideline,
  getImdrfGuidance,
  type GuidanceInput,
} from '../src/tools/guidance.js';
import { checkWhoStatus, type CheckWhoStatusInput } from '../src/tools/check-who-status.js';
import {
  mapToNationalRequirements,
  type MapToNationalRequirementsInput,
} from '../src/tools/map-national-requirements.js';
import { buildLegalStance, type BuildLegalStanceInput } from '../src/tools/build-legal-stance.js';
import { aboutServer, type AboutInput } from '../src/tools/about.js';
import { checkDataFreshness, type CheckDataFreshnessInput } from '../src/tools/check-data-freshness.js';

const SERVER_NAME = 'international-health-law-mcp';
const PKG_PATH = join(process.cwd(), 'package.json');
const pkgVersion: string = JSON.parse(readFileSync(PKG_PATH, 'utf-8')).version;

const SOURCE_DB = process.env.INTERNATIONAL_HEALTH_LAW_DB_PATH
  || join(process.cwd(), 'data', 'database.db');
const TMP_DB = '/tmp/database.db';
const TMP_DB_LOCK = '/tmp/database.db.lock';

let db: InstanceType<typeof Database> | null = null;

function getDatabase(): InstanceType<typeof Database> {
  if (!db) {
    if (existsSync(TMP_DB_LOCK)) {
      rmSync(TMP_DB_LOCK, { recursive: true, force: true });
    }
    if (!existsSync(TMP_DB)) {
      copyFileSync(SOURCE_DB, TMP_DB);
    }
    db = new Database(TMP_DB, { readonly: true });
    db.pragma('foreign_keys = ON');
  }
  return db;
}

const TOOLS: Tool[] = [
  {
    name: 'search_health_regulation',
    description: 'Search international health regulations and guidance across WHO, ICH, IMDRF, WMA, and Codex sources.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query. Supports phrase and boolean-style FTS terms.' },
        sources: { type: 'array', items: { type: 'string' }, description: 'Optional source IDs to scope the search.' },
        authorities: { type: 'array', items: { type: 'string' }, description: 'Optional authority filter.' },
        instrument_types: { type: 'array', items: { type: 'string' }, description: 'Optional instrument type filter.' },
        limit: { type: 'number', description: 'Maximum number of matches to return (1-50).' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_provision',
    description: 'Retrieve a single provision by source ID and provision ID, including full text and citation metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        source: { type: 'string', description: 'Source identifier (for example WHO_IHR_2005).' },
        provision_id: { type: 'string', description: 'Provision identifier (for example ART_6, Q9(R1), N60).' },
        include_related: { type: 'boolean', description: 'Include any related provision references if present.' },
      },
      required: ['source', 'provision_id'],
    },
  },
  {
    name: 'get_ich_guideline',
    description: 'Retrieve ICH guideline content by guideline ID or free-text query.',
    inputSchema: {
      type: 'object',
      properties: {
        guideline_id: { type: 'string', description: 'Exact or prefix guideline ID (for example Q9(R1), E6).' },
        query: { type: 'string', description: 'Free-text query within ICH guideline content.' },
        limit: { type: 'number', description: 'Maximum number of matches to return (1-50).' },
        include_full_text: { type: 'boolean', description: 'Return full text in each match.' },
      },
      required: [],
    },
  },
  {
    name: 'get_imdrf_guidance',
    description: 'Retrieve IMDRF N-series guidance by guideline ID or free-text query.',
    inputSchema: {
      type: 'object',
      properties: {
        guideline_id: { type: 'string', description: 'Exact or prefix guidance ID (for example N12, N60).' },
        query: { type: 'string', description: 'Free-text query within IMDRF guidance content.' },
        limit: { type: 'number', description: 'Maximum number of matches to return (1-50).' },
        include_full_text: { type: 'boolean', description: 'Return full text in each match.' },
      },
      required: [],
    },
  },
  {
    name: 'check_who_status',
    description: 'Check freshness and quality status for WHO-owned instruments in the local data snapshot.',
    inputSchema: {
      type: 'object',
      properties: {
        source: { type: 'string', description: 'Optional single source ID filter.' },
        include_non_who: { type: 'boolean', description: 'Include non-WHO sources in status output.' },
      },
      required: [],
    },
  },
  {
    name: 'map_to_national_requirements',
    description: 'Map international provisions to national or regional requirement frameworks.',
    inputSchema: {
      type: 'object',
      properties: {
        source: { type: 'string', description: 'Filter to mappings targeting this source ID.' },
        provision_id: { type: 'string', description: 'Filter mappings that include this provision ID.' },
        framework: { type: 'string', description: 'Filter by framework identifier.' },
        country: { type: 'string', description: 'Filter by country code.' },
        limit: { type: 'number', description: 'Maximum number of mappings to return (1-50).' },
      },
      required: [],
    },
  },
  {
    name: 'search_medical_device_requirements',
    description: 'Search medical-device-centric requirements across IMDRF, ICH, and related sources.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Medical device requirement query.' },
        sources: { type: 'array', items: { type: 'string' }, description: 'Optional source IDs to scope the search.' },
        limit: { type: 'number', description: 'Maximum number of matches to return (1-50).' },
      },
      required: ['query'],
    },
  },
  {
    name: 'build_legal_stance',
    description: 'Build a structured evidence-backed stance summary for a regulatory topic.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'Topic to evaluate.' },
        sector: { type: 'string', description: 'Optional sector filter.' },
        country: { type: 'string', description: 'Optional country code for mapping relevance.' },
        framework: { type: 'string', description: 'Optional target national framework filter.' },
        sources: { type: 'array', items: { type: 'string' }, description: 'Optional source IDs to prioritize.' },
        max_evidence: { type: 'number', description: 'Number of supporting provisions to include.' },
      },
      required: ['topic'],
    },
  },
  {
    name: 'list_sources',
    description: 'List available sources or list provisions within one source.',
    inputSchema: {
      type: 'object',
      properties: {
        source: { type: 'string', description: 'Source ID to list provisions from.' },
        parent: { type: 'string', description: 'Optional parent section filter within the source.' },
      },
      required: [],
    },
  },
  {
    name: 'about',
    description: 'Return metadata and corpus statistics for this MCP server.',
    inputSchema: {
      type: 'object',
      properties: {
        include_sources: { type: 'boolean', description: 'Include per-source metadata in output.' },
      },
      required: [],
    },
  },
  {
    name: 'check_data_freshness',
    description: 'Evaluate source freshness against warning and critical thresholds.',
    inputSchema: {
      type: 'object',
      properties: {
        warn_after_days: { type: 'number', description: 'Warning threshold in days (default 45).' },
        critical_after_days: { type: 'number', description: 'Critical threshold in days (default 120).' },
        include_ok: { type: 'boolean', description: 'Include sources already within freshness thresholds.' },
      },
      required: [],
    },
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- WASM sqlite has same runtime API as better-sqlite3 but different types
function registerTools(server: Server, database: any) {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result: unknown;

      switch (name) {
        case 'search_health_regulation':
          result = await searchHealthRegulation(database, (args ?? {}) as unknown as SearchHealthRegulationInput);
          break;
        case 'get_provision':
          result = await getProvision(database, (args ?? {}) as unknown as GetProvisionInput);
          break;
        case 'get_ich_guideline':
          result = await getIchGuideline(database, (args ?? {}) as GuidanceInput);
          break;
        case 'get_imdrf_guidance':
          result = await getImdrfGuidance(database, (args ?? {}) as GuidanceInput);
          break;
        case 'check_who_status':
          result = await checkWhoStatus(database, (args ?? {}) as CheckWhoStatusInput);
          break;
        case 'map_to_national_requirements':
          result = await mapToNationalRequirements(database, (args ?? {}) as MapToNationalRequirementsInput);
          break;
        case 'search_medical_device_requirements':
          result = await searchMedicalDeviceRequirements(database, (args ?? {}) as unknown as SearchMedicalDeviceRequirementsInput);
          break;
        case 'build_legal_stance':
          result = await buildLegalStance(database, (args ?? {}) as unknown as BuildLegalStanceInput);
          break;
        case 'list_sources':
          result = await listSources(database, (args ?? {}) as ListInput);
          break;
        case 'about':
          result = await aboutServer(database, (args ?? {}) as AboutInput);
          break;
        case 'check_data_freshness':
          result = await checkDataFreshness(database, (args ?? {}) as CheckDataFreshnessInput);
          break;
        default:
          return {
            content: [{ type: 'text', text: `Error: Unknown tool "${name}".` }],
            isError: true,
          };
      }

      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: 'text', text: `Error executing ${name}: ${message}` }], isError: true };
    }
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id');
  res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      name: SERVER_NAME,
      version: pkgVersion,
      protocol: 'mcp-streamable-http',
    });
    return;
  }

  try {
    if (!existsSync(SOURCE_DB)) {
      res.status(500).json({ error: `Database not found at ${SOURCE_DB}` });
      return;
    }

    const database = getDatabase();

    const server = new Server(
      { name: SERVER_NAME, version: pkgVersion },
      { capabilities: { tools: {} } }
    );

    registerTools(server, database);

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('MCP handler error:', message);
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
}
