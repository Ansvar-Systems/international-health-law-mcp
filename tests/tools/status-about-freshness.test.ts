import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import type { Database } from '@ansvar/mcp-sqlite';
import {
  createDomainTestDatabase,
  closeDomainTestDatabase,
} from '../fixtures/domain-db';
import { checkWhoStatus } from '../../src/tools/check-who-status';
import { checkDataFreshness } from '../../src/tools/check-data-freshness';
import { aboutServer } from '../../src/tools/about';

describe('checkWhoStatus', () => {
  let db: Database;

  beforeAll(() => {
    db = createDomainTestDatabase();
  });

  afterAll(() => {
    closeDomainTestDatabase(db);
  });

  it('returns WHO sources by default', async () => {
    const result = await checkWhoStatus(db, {});

    expect(result.total_sources).toBeGreaterThan(0);
    expect(result.sources.every((source) => source.source.startsWith('WHO_'))).toBe(true);
  });

  it('filters to a single source', async () => {
    const result = await checkWhoStatus(db, { source: 'WHO_IHR_2005' });

    expect(result.total_sources).toBe(1);
    expect(result.sources[0].source).toBe('WHO_IHR_2005');
  });
});

describe('checkDataFreshness', () => {
  let db: Database;

  beforeAll(() => {
    db = createDomainTestDatabase();
  });

  afterAll(() => {
    closeDomainTestDatabase(db);
  });

  it('returns freshness summary', async () => {
    const result = await checkDataFreshness(db, {
      warn_after_days: 30,
      critical_after_days: 90,
    });

    expect(result.summary.total_sources).toBeGreaterThan(0);
    expect(result.sources.length).toBeGreaterThan(0);
  });
});

describe('aboutServer', () => {
  let db: Database;

  beforeAll(() => {
    db = createDomainTestDatabase();
  });

  afterAll(() => {
    closeDomainTestDatabase(db);
  });

  it('returns corpus stats and tool list', async () => {
    const result = await aboutServer(db, {});

    expect(result.stats.sources).toBeGreaterThan(0);
    expect(result.tools).toContain('search_health_regulation');
    expect(result.sources?.length).toBeGreaterThan(0);
  });
});
