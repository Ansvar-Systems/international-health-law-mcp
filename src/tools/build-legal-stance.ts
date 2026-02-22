import type { Database } from '@ansvar/mcp-sqlite';
import { searchHealthRegulation, type RegulationSearchResult } from './search-health-regulation.js';
import { mapToNationalRequirements, type NationalRequirementMapping } from './map-national-requirements.js';

export interface BuildLegalStanceInput {
  topic: string;
  sector?: string;
  country?: string;
  framework?: string;
  sources?: string[];
  max_evidence?: number;
}

export interface LegalStanceResult {
  topic: string;
  sector: string | null;
  country: string | null;
  framework: string | null;
  recommended_position: string;
  supporting_sources: string[];
  evidence: Array<{
    citation: string;
    source: string;
    title: string | null;
    snippet: string;
    relevance: number;
  }>;
  applicability_assessment: Array<{
    source: string;
    sector: string;
    subsector: string | null;
    confidence: string | null;
    basis_item: string | null;
    notes: string | null;
  }>;
  mapped_national_requirements: NationalRequirementMapping[];
  caveats: string[];
}

interface ApplicabilityRow {
  source: string;
  sector: string;
  subsector: string | null;
  applies: number;
  confidence: string | null;
  basis_item: string | null;
  notes: string | null;
}

const DEFAULT_MAX_EVIDENCE = 6;

export async function buildLegalStance(
  db: Database,
  input: BuildLegalStanceInput
): Promise<LegalStanceResult> {
  if (!input.topic || input.topic.trim().length === 0) {
    throw new Error('topic is required');
  }

  const topic = input.topic.trim();
  const maxEvidence = normalizeEvidenceLimit(input.max_evidence);

  const searchResults = await searchHealthRegulation(db, {
    query: topic,
    sources: input.sources,
    limit: maxEvidence,
  });

  const supportingSources = unique(searchResults.map((result) => result.source));
  const evidence = searchResults.map((result) => toEvidence(result));

  const applicability = loadApplicability(db, supportingSources, input.sector?.trim() || null)
    .filter((row) => row.applies === 1)
    .map((row) => ({
      source: row.source,
      sector: row.sector,
      subsector: row.subsector,
      confidence: row.confidence,
      basis_item: row.basis_item,
      notes: row.notes,
    }));

  const mappedNationalRequirements = (await mapToNationalRequirements(db, {
    country: input.country?.trim() || undefined,
    framework: input.framework?.trim() || undefined,
    limit: 15,
  })).mappings.filter((mapping) =>
    supportingSources.length === 0 || supportingSources.includes(mapping.target_source)
  );

  const recommendedPosition = createPositionStatement(
    topic,
    evidence,
    applicability,
    mappedNationalRequirements.length
  );

  const caveats = [
    'This is a structured evidence summary and not legal advice.',
    'Confirm current obligations against official source publications before filing or enforcement actions.',
  ];

  if (searchResults.length === 0) {
    caveats.unshift('No direct provision match was found for the topic in the local snapshot data.');
  }

  return {
    topic,
    sector: input.sector?.trim() || null,
    country: input.country?.trim() || null,
    framework: input.framework?.trim() || null,
    recommended_position: recommendedPosition,
    supporting_sources: supportingSources,
    evidence,
    applicability_assessment: applicability,
    mapped_national_requirements: mappedNationalRequirements,
    caveats,
  };
}

function loadApplicability(
  db: Database,
  sources: string[],
  sector: string | null
): ApplicabilityRow[] {
  if (!tableExists(db, 'applicability_rules')) {
    return [];
  }

  let sql = `
    SELECT source, sector, subsector, applies, confidence, basis_item, notes
    FROM applicability_rules
    WHERE 1 = 1
  `;

  const params: string[] = [];

  if (sources.length > 0) {
    sql += ` AND source IN (${sources.map(() => '?').join(', ')})`;
    params.push(...sources);
  }

  if (sector) {
    sql += ' AND sector = ?';
    params.push(sector);
  }

  sql += ' ORDER BY source, sector, subsector';

  return db.prepare(sql).all(...params) as ApplicabilityRow[];
}

function createPositionStatement(
  topic: string,
  evidence: LegalStanceResult['evidence'],
  applicability: LegalStanceResult['applicability_assessment'],
  mappedRequirementCount: number
): string {
  if (evidence.length === 0) {
    return `Insufficient direct evidence was found for "${topic}" in the local corpus. Start with source discovery and broaden query terms before issuing a policy position.`;
  }

  const leadingCitations = evidence.slice(0, 3).map((entry) => entry.citation).join(', ');
  const applicabilityText = applicability.length > 0
    ? `Applicability rules indicate direct relevance for ${applicability.length} sector rule(s).`
    : 'No explicit applicability rule was triggered for the selected sector filters.';

  return [
    `Adopt a risk-based compliance position for "${topic}" anchored in ${leadingCitations}.`,
    applicabilityText,
    `Mapped national requirement references available: ${mappedRequirementCount}.`,
  ].join(' ');
}

function toEvidence(result: RegulationSearchResult): LegalStanceResult['evidence'][number] {
  return {
    citation: `${result.source} ${result.item_id}`,
    source: result.source,
    title: result.title,
    snippet: result.snippet,
    relevance: result.relevance,
  };
}

function normalizeEvidenceLimit(limit: number | undefined): number {
  if (!Number.isFinite(limit)) {
    return DEFAULT_MAX_EVIDENCE;
  }

  const parsed = Math.trunc(Number(limit));
  if (parsed < 1) {
    return DEFAULT_MAX_EVIDENCE;
  }

  return Math.min(parsed, 12);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function tableExists(db: Database, tableName: string): boolean {
  const row = db
    .prepare(
      `SELECT 1 as present FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1`
    )
    .get(tableName) as { present: number } | undefined;

  return Boolean(row);
}
