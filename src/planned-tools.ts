import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const DOMAIN_NAME = "International Health Law MCP";
export const TIER1_BASELINE_DATE = "2026-02-22";
export const PLANNED_TOOL_NAMES = [
  "search_health_regulation",
  "get_provision",
  "get_ich_guideline",
  "get_imdrf_guidance",
  "check_who_status",
  "build_legal_stance",
  "map_to_national_requirements",
  "search_medical_device_requirements",
  "list_sources",
  "check_data_freshness",
  "about",
] as const;

const PLANNED_TOOL_SET = new Set<string>(PLANNED_TOOL_NAMES);

export const PLANNED_TOOLS: Tool[] = PLANNED_TOOL_NAMES.map((toolName) => ({
  name: toolName,
  description:
    `Implemented MCP tool in ${DOMAIN_NAME}.`,
  inputSchema: {
    type: 'object',
    properties: {},
    additionalProperties: true,
  },
}));

export function isPlannedTool(name: string): boolean {
  return PLANNED_TOOL_SET.has(name);
}

export function createPlannedToolResponse(toolName: string, args: unknown): Record<string, unknown> {
  return {
    status: 'implemented',
    tool: toolName,
    domain: DOMAIN_NAME,
    baseline_date: TIER1_BASELINE_DATE,
    next_step: 'Invoke this tool through the MCP server handlers in src/index.ts.',
    received_args: args ?? {},
  };
}
