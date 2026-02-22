import type { Database } from '@ansvar/mcp-sqlite';
import { parseJsonField } from './common.js';

export interface GetProvisionInput {
  source: string;
  provision_id?: string;
  item_id?: string;
  include_related?: boolean;
}

export interface ProvisionRecord {
  source: string;
  source_name: string;
  source_url: string | null;
  authority: string | null;
  instrument_type: string | null;
  provision_id: string;
  title: string | null;
  text: string;
  parent: string | null;
  tags: string[];
  metadata: Record<string, unknown> | null;
  related: unknown[] | null;
  citation: string;
  official_reference_url: string | null;
}

interface ProvisionRow {
  source: string;
  source_name: string;
  source_url: string | null;
  authority: string | null;
  instrument_type: string | null;
  item_id: string;
  title: string | null;
  text: string;
  parent: string | null;
  tags: string | null;
  metadata: string | null;
  related: string | null;
}

export async function getProvision(
  db: Database,
  input: GetProvisionInput
): Promise<ProvisionRecord | null> {
  if (!input.source || input.source.trim().length === 0) {
    throw new Error('source is required');
  }

  const requestedProvisionId =
    input.provision_id?.trim() ||
    input.item_id?.trim() ||
    '';

  if (requestedProvisionId.length === 0) {
    throw new Error('provision_id is required');
  }

  const source = input.source.trim();

  const row = db
    .prepare(
      `
      SELECT
        i.source,
        s.full_name as source_name,
        s.source_url,
        s.authority,
        s.instrument_type,
        i.item_id,
        i.title,
        i.text,
        i.parent,
        i.tags,
        i.metadata,
        i.related
      FROM items i
      JOIN sources s ON s.id = i.source
      WHERE i.source = ? AND i.item_id = ?
    `
    )
    .get(source, requestedProvisionId) as ProvisionRow | undefined;

  if (!row) {
    return null;
  }

  const metadata = parseJsonField<Record<string, unknown>>(row.metadata);
  const tags = parseJsonField<string[]>(row.tags) ?? [];
  const related = input.include_related
    ? parseJsonField<unknown[]>(row.related)
    : null;

  const metadataUrl = metadata?.official_url;
  const officialReferenceUrl =
    typeof metadataUrl === 'string' && metadataUrl.length > 0
      ? metadataUrl
      : row.source_url;

  return {
    source: row.source,
    source_name: row.source_name,
    source_url: row.source_url,
    authority: row.authority,
    instrument_type: row.instrument_type,
    provision_id: row.item_id,
    title: row.title,
    text: row.text,
    parent: row.parent,
    tags,
    metadata,
    related,
    citation: `${row.source} ${row.item_id}`,
    official_reference_url: officialReferenceUrl,
  };
}
