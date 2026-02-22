#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import Database from '@ansvar/mcp-sqlite';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { listSources, type ListInput } from './tools/list.js';
import {
  searchHealthRegulation,
  searchMedicalDeviceRequirements,
  type SearchHealthRegulationInput,
  type SearchMedicalDeviceRequirementsInput,
} from './tools/search-health-regulation.js';
import { getProvision, type GetProvisionInput } from './tools/get-provision.js';
import {
  getIchGuideline,
  getImdrfGuidance,
  type GuidanceInput,
} from './tools/guidance.js';
import { checkWhoStatus, type CheckWhoStatusInput } from './tools/check-who-status.js';
import {
  mapToNationalRequirements,
  type MapToNationalRequirementsInput,
} from './tools/map-national-requirements.js';
import { buildLegalStance, type BuildLegalStanceInput } from './tools/build-legal-stance.js';
import { aboutServer, type AboutInput } from './tools/about.js';
import { checkDataFreshness, type CheckDataFreshnessInput } from './tools/check-data-freshness.js';

const SERVER_NAME = 'international-health-law-mcp';
const SERVER_VERSION = '0.1.0';

const DB_ENV_VAR = 'INTERNATIONAL_HEALTH_LAW_DB_PATH';
const DEFAULT_DB_PATH = '../data/database.db';

let dbInstance: InstanceType<typeof Database> | null = null;

function getDefaultDbPath(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.resolve(__dirname, DEFAULT_DB_PATH);
}

function getDb(): InstanceType<typeof Database> {
  if (!dbInstance) {
    const dbPath = process.env[DB_ENV_VAR] || getDefaultDbPath();
    dbInstance = new Database(dbPath, { readonly: true });
    dbInstance.pragma('foreign_keys = ON');
    console.error(`[${SERVER_NAME}] Using database ${dbPath}`);
  }

  return dbInstance;
}

function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
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
        authorities: { type: 'array', items: { type: 'string' }, description: 'Optional authority filter (for example World Health Organization).' },
        instrument_types: { type: 'array', items: { type: 'string' }, description: 'Optional instrument type filter (guideline, treaty, regulation, standard).' },
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
        provision_id: { type: 'string', description: 'Filter mappings that include this provision ID in target_items.' },
        framework: { type: 'string', description: 'Filter by framework identifier (for example EU_MDR_2017_745).' },
        country: { type: 'string', description: 'Filter by country code (for example US, EU, JP).' },
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
        topic: { type: 'string', description: 'Topic to evaluate (for example incident notification, SaMD cybersecurity).' },
        sector: { type: 'string', description: 'Optional sector filter (for example medical-devices, healthcare).' },
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

const server = new Server(
  {
    name: SERVER_NAME,
    version: SERVER_VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case 'search_health_regulation':
        result = await searchHealthRegulation(
          getDb(),
          (args ?? {}) as unknown as SearchHealthRegulationInput
        );
        break;

      case 'get_provision':
        result = await getProvision(getDb(), (args ?? {}) as unknown as GetProvisionInput);
        break;

      case 'get_ich_guideline':
        result = await getIchGuideline(getDb(), (args ?? {}) as GuidanceInput);
        break;

      case 'get_imdrf_guidance':
        result = await getImdrfGuidance(getDb(), (args ?? {}) as GuidanceInput);
        break;

      case 'check_who_status':
        result = await checkWhoStatus(getDb(), (args ?? {}) as CheckWhoStatusInput);
        break;

      case 'map_to_national_requirements':
        result = await mapToNationalRequirements(
          getDb(),
          (args ?? {}) as MapToNationalRequirementsInput
        );
        break;

      case 'search_medical_device_requirements':
        result = await searchMedicalDeviceRequirements(
          getDb(),
          (args ?? {}) as unknown as SearchMedicalDeviceRequirementsInput
        );
        break;

      case 'build_legal_stance':
        result = await buildLegalStance(
          getDb(),
          (args ?? {}) as unknown as BuildLegalStanceInput
        );
        break;

      case 'list_sources':
        result = await listSources(getDb(), (args ?? {}) as ListInput);
        break;

      case 'about':
        result = await aboutServer(getDb(), (args ?? {}) as AboutInput);
        break;

      case 'check_data_freshness':
        result = await checkDataFreshness(getDb(), (args ?? {}) as CheckDataFreshnessInput);
        break;

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Error: Unknown tool "${name}". Use ListTools to inspect available tools.`,
            },
          ],
          isError: true,
        };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();

  process.on('SIGINT', () => {
    closeDb();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    closeDb();
    process.exit(0);
  });

  await server.connect(transport);
  console.error(`[${SERVER_NAME}] Ready`);
}

main().catch((error) => {
  console.error(`[${SERVER_NAME}] Fatal error`, error);
  closeDb();
  process.exit(1);
});
