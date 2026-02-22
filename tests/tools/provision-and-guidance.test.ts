import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import type { Database } from 'better-sqlite3';
import {
  createDomainTestDatabase,
  closeDomainTestDatabase,
} from '../fixtures/domain-db';
import { getProvision } from '../../src/tools/get-provision';
import { getIchGuideline, getImdrfGuidance } from '../../src/tools/guidance';

describe('getProvision', () => {
  let db: Database;

  beforeAll(() => {
    db = createDomainTestDatabase();
  });

  afterAll(() => {
    closeDomainTestDatabase(db);
  });

  it('returns a provision with citation metadata', async () => {
    const result = await getProvision(db, {
      source: 'WHO_IHR_2005',
      provision_id: 'ART_6',
    });

    expect(result).not.toBeNull();
    expect(result?.citation).toBe('WHO_IHR_2005 ART_6');
    expect(result?.text).toContain('notify WHO');
  });

  it('returns null for missing provision', async () => {
    const result = await getProvision(db, {
      source: 'WHO_IHR_2005',
      provision_id: 'UNKNOWN',
    });

    expect(result).toBeNull();
  });
});

describe('guidance retrieval', () => {
  let db: Database;

  beforeAll(() => {
    db = createDomainTestDatabase();
  });

  afterAll(() => {
    closeDomainTestDatabase(db);
  });

  it('retrieves ICH guideline by id', async () => {
    const result = await getIchGuideline(db, {
      guideline_id: 'Q9',
      include_full_text: true,
    });

    expect(result.source).toBe('ICH_GUIDELINES');
    expect(result.result_count).toBeGreaterThan(0);
    expect(result.guidelines[0].item_id.startsWith('Q9')).toBe(true);
    expect(result.guidelines[0].text).toBeTruthy();
  });

  it('retrieves IMDRF guidance by query', async () => {
    const result = await getImdrfGuidance(db, {
      query: 'cybersecurity',
    });

    expect(result.source).toBe('IMDRF_N_SERIES');
    expect(result.result_count).toBeGreaterThan(0);
    expect(result.guidelines.some((entry) => entry.item_id === 'N60')).toBe(true);
  });
});
