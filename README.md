# International Health Law MCP

MCP server for international health law and regulatory instruments across WHO, ICH, IMDRF, WMA, and Codex sources.

## Identity

- Package: `@ansvar/international-health-law-mcp`
- MCP name: `eu.ansvar/international-health-law`
- Deployment target: Strategy A (Vercel)
- Database env var: `INTERNATIONAL_HEALTH_LAW_DB_PATH`

## Implemented Tools

- `search_health_regulation`
- `get_provision`
- `get_ich_guideline`
- `get_imdrf_guidance`
- `check_who_status`
- `map_to_national_requirements`
- `search_medical_device_requirements`
- `build_legal_stance`
- `list_sources`
- `about`
- `check_data_freshness`

## Data Coverage

Current corpus status (from `data/coverage.json`):

- Sources: 7 / 7 implemented
- Tools: 11 / 11 implemented
- Items: 609
- Definitions: 3
- Mappings: 6

Source item counts:

- `WHO_CONSTITUTION`: 47
- `WHO_IHR_2005`: 72
- `WHO_FCTC`: 36
- `ICH_GUIDELINES`: 151
- `IMDRF_N_SERIES`: 28
- `DECLARATION_HELSINKI`: 36
- `CODEX_ALIMENTARIUS`: 239

## Quick Start

```bash
npm install
npm run ingest      # fetch + normalize full corpus into data/seed/
npm run build:db    # build SQLite database from seeds
npm run build
npm run dev
```

## Run Tests

```bash
npm test
```

## Runtime

Use with default database path:

```bash
node dist/index.js
```

Use a custom database path:

```bash
INTERNATIONAL_HEALTH_LAW_DB_PATH=/absolute/path/to/database.db node dist/index.js
```

## Data Maintenance

- Regenerate seed snapshots: `npm run ingest`
- Rebuild database: `npm run build:db`
- Freshness report: `npm run check-updates`

## Notes

- Ingestion is source-backed and writes normalized JSON seed snapshots used for local DB builds and tests.
- Coverage metadata is generated into `data/coverage.json` on every ingest run.
