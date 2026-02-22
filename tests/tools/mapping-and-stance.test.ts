import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import type { Database } from '@ansvar/mcp-sqlite';
import {
  createDomainTestDatabase,
  closeDomainTestDatabase,
} from '../fixtures/domain-db';
import { mapToNationalRequirements } from '../../src/tools/map-national-requirements';
import { buildLegalStance } from '../../src/tools/build-legal-stance';

describe('mapToNationalRequirements', () => {
  let db: Database;

  beforeAll(() => {
    db = createDomainTestDatabase();
  });

  afterAll(() => {
    closeDomainTestDatabase(db);
  });

  it('returns mappings filtered by framework', async () => {
    const result = await mapToNationalRequirements(db, {
      framework: 'EU_MDR_2017_745',
    });

    expect(result.total_mappings).toBeGreaterThan(0);
    expect(result.mappings.every((mapping) => mapping.framework === 'EU_MDR_2017_745')).toBe(true);
  });

  it('filters mappings by provision id', async () => {
    const result = await mapToNationalRequirements(db, {
      provision_id: 'N60',
    });

    expect(result.total_mappings).toBeGreaterThan(0);
    expect(result.mappings.some((mapping) => mapping.target_items.includes('N60'))).toBe(true);
  });
});

describe('buildLegalStance', () => {
  let db: Database;

  beforeAll(() => {
    db = createDomainTestDatabase();
  });

  afterAll(() => {
    closeDomainTestDatabase(db);
  });

  it('builds an evidence-backed stance', async () => {
    const result = await buildLegalStance(db, {
      topic: 'medical device cybersecurity lifecycle',
      sector: 'medical-devices',
      country: 'EU',
      framework: 'EU_MDR_2017_745',
    });

    expect(result.recommended_position.length).toBeGreaterThan(0);
    expect(result.evidence.length).toBeGreaterThan(0);
    expect(result.supporting_sources.length).toBeGreaterThan(0);
  });

  it('requires topic', async () => {
    await expect(
      buildLegalStance(db, { topic: '   ' })
    ).rejects.toThrow('topic is required');
  });
});
