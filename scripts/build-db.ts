#!/usr/bin/env tsx
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

interface SeedItem {
  item_id: string;
  title?: string | null;
  text: string;
  parent?: string | null;
  tags?: string[];
  metadata?: Record<string, unknown> | null;
  related?: unknown[] | null;
}

interface SeedDefinition {
  term: string;
  definition: string;
  defining_item?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface SeedMapping {
  framework: string;
  control_id: string;
  control_name?: string | null;
  target_source: string;
  target_items: string[];
  coverage: 'full' | 'partial' | 'related';
  notes?: string | null;
  country?: string | null;
  jurisdiction?: string | null;
}

interface SeedApplicabilityRule {
  sector: string;
  subsector?: string | null;
  applies: 0 | 1;
  confidence: 'definite' | 'likely' | 'possible';
  basis_item?: string | null;
  conditions?: Record<string, unknown> | null;
  notes?: string | null;
}

interface SeedRegistry {
  official_id?: string | null;
  official_version?: string | null;
  last_fetched?: string | null;
  last_updated?: string | null;
  last_checked?: string | null;
  update_frequency?: string | null;
  items_expected?: number | null;
  items_parsed?: number | null;
  quality_status?: 'complete' | 'review' | 'incomplete' | null;
  notes?: string | null;
}

interface SeedSource {
  id: string;
  full_name: string;
  identifier?: string | null;
  authority?: string | null;
  jurisdiction?: string | null;
  instrument_type?: string | null;
  category?: string | null;
  effective_date?: string | null;
  source_url?: string | null;
  items: SeedItem[];
  definitions?: SeedDefinition[];
  mappings?: SeedMapping[];
  applicability_rules?: SeedApplicabilityRule[];
  source_registry?: SeedRegistry | null;
}

const SCHEMA = `
CREATE TABLE sources (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  identifier TEXT,
  authority TEXT,
  jurisdiction TEXT DEFAULT 'INTL',
  instrument_type TEXT,
  category TEXT,
  effective_date TEXT,
  source_url TEXT
);

CREATE TABLE items (
  rowid INTEGER PRIMARY KEY,
  source TEXT NOT NULL REFERENCES sources(id),
  item_id TEXT NOT NULL,
  title TEXT,
  text TEXT NOT NULL,
  parent TEXT,
  tags TEXT,
  metadata TEXT,
  related TEXT,
  UNIQUE(source, item_id)
);

CREATE INDEX idx_items_source ON items(source);
CREATE INDEX idx_items_source_parent ON items(source, parent);

CREATE VIRTUAL TABLE items_fts USING fts5(
  source,
  item_id,
  title,
  text,
  content='items',
  content_rowid='rowid'
);

CREATE TRIGGER items_ai AFTER INSERT ON items BEGIN
  INSERT INTO items_fts(rowid, source, item_id, title, text)
  VALUES (new.rowid, new.source, new.item_id, new.title, new.text);
END;

CREATE TRIGGER items_au AFTER UPDATE ON items BEGIN
  INSERT INTO items_fts(items_fts, rowid, source, item_id, title, text)
  VALUES ('delete', old.rowid, old.source, old.item_id, old.title, old.text);
  INSERT INTO items_fts(rowid, source, item_id, title, text)
  VALUES (new.rowid, new.source, new.item_id, new.title, new.text);
END;

CREATE TRIGGER items_ad AFTER DELETE ON items BEGIN
  INSERT INTO items_fts(items_fts, rowid, source, item_id, title, text)
  VALUES ('delete', old.rowid, old.source, old.item_id, old.title, old.text);
END;

CREATE TABLE definitions (
  id INTEGER PRIMARY KEY,
  source TEXT NOT NULL REFERENCES sources(id),
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  defining_item TEXT,
  metadata TEXT,
  UNIQUE(source, term)
);

CREATE INDEX idx_definitions_source ON definitions(source);
CREATE INDEX idx_definitions_term ON definitions(term);

CREATE TABLE mappings (
  id INTEGER PRIMARY KEY,
  framework TEXT NOT NULL,
  control_id TEXT NOT NULL,
  control_name TEXT,
  target_source TEXT NOT NULL REFERENCES sources(id),
  target_items TEXT NOT NULL,
  coverage TEXT CHECK(coverage IN ('full', 'partial', 'related')),
  notes TEXT,
  country TEXT,
  jurisdiction TEXT
);

CREATE INDEX idx_mappings_framework ON mappings(framework);
CREATE INDEX idx_mappings_target_source ON mappings(target_source);
CREATE INDEX idx_mappings_country ON mappings(country);

CREATE TABLE applicability_rules (
  id INTEGER PRIMARY KEY,
  source TEXT NOT NULL REFERENCES sources(id),
  sector TEXT NOT NULL,
  subsector TEXT,
  applies INTEGER NOT NULL,
  confidence TEXT CHECK(confidence IN ('definite', 'likely', 'possible')),
  basis_item TEXT,
  conditions TEXT,
  notes TEXT
);

CREATE INDEX idx_applicability_source ON applicability_rules(source);
CREATE INDEX idx_applicability_sector ON applicability_rules(sector);

CREATE TABLE source_registry (
  source TEXT PRIMARY KEY REFERENCES sources(id),
  official_id TEXT,
  official_version TEXT,
  last_fetched TEXT,
  last_updated TEXT,
  last_checked TEXT,
  update_frequency TEXT,
  items_expected INTEGER,
  items_parsed INTEGER,
  quality_status TEXT CHECK(quality_status IN ('complete', 'review', 'incomplete')),
  notes TEXT
);
`;

function resolvePaths(): { seedDir: string; dbPath: string } {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(scriptDir, '..');

  const seedDir = path.resolve(repoRoot, 'data', 'seed');
  const dbPath = process.env.INTERNATIONAL_HEALTH_LAW_DB_PATH
    ? path.resolve(process.env.INTERNATIONAL_HEALTH_LAW_DB_PATH)
    : path.resolve(repoRoot, 'data', 'database.db');

  return { seedDir, dbPath };
}

function readSeedFiles(seedDir: string): SeedSource[] {
  if (!fs.existsSync(seedDir)) {
    throw new Error(`Seed directory not found: ${seedDir}`);
  }

  const seedFiles = fs
    .readdirSync(seedDir)
    .filter((fileName) => fileName.endsWith('.json') && !fileName.startsWith('.'))
    .sort((left, right) => left.localeCompare(right));

  if (seedFiles.length === 0) {
    throw new Error(`No seed files found in ${seedDir}. Run npm run ingest first.`);
  }

  return seedFiles.map((fileName) => {
    const filePath = path.join(seedDir, fileName);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw) as SeedSource;
    validateSeed(parsed, filePath);
    return parsed;
  });
}

function validateSeed(seed: SeedSource, filePath: string): void {
  if (!seed.id || !seed.full_name) {
    throw new Error(`Invalid seed (${filePath}): missing required id/full_name`);
  }

  if (!Array.isArray(seed.items)) {
    throw new Error(`Invalid seed (${filePath}): items must be an array`);
  }

  for (const [index, item] of seed.items.entries()) {
    if (!item.item_id || !item.text) {
      throw new Error(
        `Invalid seed (${filePath}) item[${index}]: item_id and text are required`
      );
    }
  }
}

function resetDatabaseFile(dbPath: string): void {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
}

function buildDatabase(seedSources: SeedSource[], dbPath: string): void {
  resetDatabaseFile(dbPath);

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(SCHEMA);

  const insertSource = db.prepare(`
    INSERT INTO sources (
      id,
      full_name,
      identifier,
      authority,
      jurisdiction,
      instrument_type,
      category,
      effective_date,
      source_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertItem = db.prepare(`
    INSERT INTO items (
      source,
      item_id,
      title,
      text,
      parent,
      tags,
      metadata,
      related
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertDefinition = db.prepare(`
    INSERT INTO definitions (
      source,
      term,
      definition,
      defining_item,
      metadata
    ) VALUES (?, ?, ?, ?, ?)
  `);

  const insertMapping = db.prepare(`
    INSERT INTO mappings (
      framework,
      control_id,
      control_name,
      target_source,
      target_items,
      coverage,
      notes,
      country,
      jurisdiction
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertApplicabilityRule = db.prepare(`
    INSERT INTO applicability_rules (
      source,
      sector,
      subsector,
      applies,
      confidence,
      basis_item,
      conditions,
      notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRegistry = db.prepare(`
    INSERT INTO source_registry (
      source,
      official_id,
      official_version,
      last_fetched,
      last_updated,
      last_checked,
      update_frequency,
      items_expected,
      items_parsed,
      quality_status,
      notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAll = db.transaction((sources: SeedSource[]) => {
    for (const source of sources) {
      insertSource.run(
        source.id,
        source.full_name,
        source.identifier ?? null,
        source.authority ?? null,
        source.jurisdiction ?? 'INTL',
        source.instrument_type ?? null,
        source.category ?? null,
        source.effective_date ?? null,
        source.source_url ?? null
      );

      for (const item of source.items) {
        insertItem.run(
          source.id,
          item.item_id,
          item.title ?? null,
          item.text,
          item.parent ?? null,
          item.tags ? JSON.stringify(item.tags) : null,
          item.metadata ? JSON.stringify(item.metadata) : null,
          item.related ? JSON.stringify(item.related) : null
        );
      }

      for (const definition of source.definitions ?? []) {
        insertDefinition.run(
          source.id,
          definition.term,
          definition.definition,
          definition.defining_item ?? null,
          definition.metadata ? JSON.stringify(definition.metadata) : null
        );
      }

      for (const mapping of source.mappings ?? []) {
        insertMapping.run(
          mapping.framework,
          mapping.control_id,
          mapping.control_name ?? null,
          mapping.target_source,
          JSON.stringify(mapping.target_items),
          mapping.coverage,
          mapping.notes ?? null,
          mapping.country ?? null,
          mapping.jurisdiction ?? null
        );
      }

      for (const rule of source.applicability_rules ?? []) {
        insertApplicabilityRule.run(
          source.id,
          rule.sector,
          rule.subsector ?? null,
          rule.applies,
          rule.confidence,
          rule.basis_item ?? null,
          rule.conditions ? JSON.stringify(rule.conditions) : null,
          rule.notes ?? null
        );
      }

      const registry = source.source_registry;
      insertRegistry.run(
        source.id,
        registry?.official_id ?? source.identifier ?? null,
        registry?.official_version ?? null,
        registry?.last_fetched ?? null,
        registry?.last_updated ?? null,
        registry?.last_checked ?? null,
        registry?.update_frequency ?? null,
        registry?.items_expected ?? source.items.length,
        registry?.items_parsed ?? source.items.length,
        registry?.quality_status ?? 'review',
        registry?.notes ?? null
      );
    }
  });

  insertAll(seedSources);

  const metrics = {
    sources: db.prepare('SELECT COUNT(*) AS value FROM sources').get() as { value: number },
    items: db.prepare('SELECT COUNT(*) AS value FROM items').get() as { value: number },
    definitions: db.prepare('SELECT COUNT(*) AS value FROM definitions').get() as { value: number },
    mappings: db.prepare('SELECT COUNT(*) AS value FROM mappings').get() as { value: number },
  };

  db.close();

  console.log('Database build complete');
  console.log(`  sources: ${metrics.sources.value}`);
  console.log(`  items: ${metrics.items.value}`);
  console.log(`  definitions: ${metrics.definitions.value}`);
  console.log(`  mappings: ${metrics.mappings.value}`);
  console.log(`  output: ${dbPath}`);
}

function main(): void {
  const { seedDir, dbPath } = resolvePaths();
  const seedSources = readSeedFiles(seedDir);
  buildDatabase(seedSources, dbPath);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`build-db failed: ${message}`);
  process.exit(1);
}
