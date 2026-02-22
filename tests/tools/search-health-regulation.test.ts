import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import type { Database } from 'better-sqlite3';
import {
  createDomainTestDatabase,
  closeDomainTestDatabase,
} from '../fixtures/domain-db';
import {
  searchHealthRegulation,
  searchMedicalDeviceRequirements,
} from '../../src/tools/search-health-regulation';

describe('searchHealthRegulation', () => {
  let db: Database;

  beforeAll(() => {
    db = createDomainTestDatabase();
  });

  afterAll(() => {
    closeDomainTestDatabase(db);
  });

  it('returns ranked regulation matches', async () => {
    const result = await searchHealthRegulation(db, {
      query: 'notification',
      limit: 5,
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result.some((item) => item.source === 'WHO_IHR_2005')).toBe(true);
  });

  it('supports source filtering', async () => {
    const result = await searchHealthRegulation(db, {
      query: 'risk',
      sources: ['ICH_GUIDELINES'],
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.source === 'ICH_GUIDELINES')).toBe(true);
  });

  it('returns empty result for empty query', async () => {
    const result = await searchHealthRegulation(db, { query: '   ' });
    expect(result).toEqual([]);
  });
});

describe('searchMedicalDeviceRequirements', () => {
  let db: Database;

  beforeAll(() => {
    db = createDomainTestDatabase();
  });

  afterAll(() => {
    closeDomainTestDatabase(db);
  });

  it('focuses on device-relevant sources', async () => {
    const result = await searchMedicalDeviceRequirements(db, {
      query: 'cybersecurity lifecycle',
    });

    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every(
        (item) =>
          item.source === 'IMDRF_N_SERIES' ||
          item.source === 'ICH_GUIDELINES' ||
          item.category === 'medical-devices'
      )
    ).toBe(true);
  });
});
