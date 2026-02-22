# CLAUDE.md

> Instructions for Claude Code when working on this MCP server

## Project Overview

This is an MCP (Model Context Protocol) server that provides AI assistants access to international health law and regulatory instruments across WHO, ICH, IMDRF, WMA, and Codex sources. Built with TypeScript and SQLite FTS5 for full-text search.

## Architecture

```
src/
├── index.ts                      # MCP server entry point (stdio transport, better-sqlite3)
└── tools/
    ├── about.ts                  # Server metadata and corpus statistics
    ├── build-legal-stance.ts     # Evidence-backed regulatory stance builder
    ├── check-data-freshness.ts   # Source freshness evaluation
    ├── check-who-status.ts       # WHO instrument status checker
    ├── common.ts                 # Shared utilities (FTS escape, limit clamp)
    ├── definitions.ts            # Term definitions lookup
    ├── get-item.ts               # Generic item retrieval
    ├── get-provision.ts          # Provision retrieval by source + ID
    ├── guidance.ts               # ICH guideline and IMDRF guidance tools
    ├── list.ts                   # List sources and browse provisions
    ├── map-national-requirements.ts  # International-to-national mapping
    ├── search.ts                 # Generic full-text search
    └── search-health-regulation.ts   # Health regulation + medical device search

api/
├── mcp.ts                        # Vercel Streamable HTTP handler (@ansvar/mcp-sqlite WASM)
└── health.ts                     # Health/version endpoint

scripts/
├── build-db.ts                   # Build SQLite database from seed files
├── seed-catalog.ts               # Seed data snapshots
├── ingest.ts                     # Ingest from external sources
└── check-updates.ts              # Check for source updates

data/
└── database.db                   # SQLite database (1.5MB, 609 items, 7 sources)
```

## Key Patterns

### Dual Transport

- **stdio** (npm): Uses `better-sqlite3` (native) in `src/index.ts`
- **Vercel Streamable HTTP**: Uses `@ansvar/mcp-sqlite` (WASM) in `api/mcp.ts`

### Database Access

Always use parameterized queries to prevent SQL injection:

```typescript
db.prepare('SELECT * FROM items WHERE source = ? AND item_id = ?').get(source, id);
```

### FTS5 Search

Escape user input before FTS5 queries using `escapeFTS5Query()` from `src/tools/common.ts`.

## Common Commands

```bash
npm run dev              # Run server with tsx
npm run build            # Compile TypeScript
npm test                 # Run tests (96 tests)
npm run build:db         # Rebuild database from seed
npm run check-updates    # Check for upstream changes
npm run validate         # Lint + test
```

## Tools (11)

`search_health_regulation`, `get_provision`, `get_ich_guideline`, `get_imdrf_guidance`, `check_who_status`, `map_to_national_requirements`, `search_medical_device_requirements`, `build_legal_stance`, `list_sources`, `about`, `check_data_freshness`

## Data Sources (7)

| Source | Items | Authority |
|--------|------:|-----------|
| WHO Constitution | 47 | World Health Organization |
| IHR (2005) | 72 | World Health Organization |
| WHO FCTC | 36 | World Health Organization |
| ICH Guidelines | 151 | International Council for Harmonisation |
| IMDRF N-series | 28 | International Medical Device Regulators Forum |
| Declaration of Helsinki | 36 | World Medical Association |
| Codex Alimentarius | 239 | FAO/WHO Codex Alimentarius Commission |

## Git Workflow

- **Never commit directly to `main`.** Always create a feature branch and open a Pull Request.
- Use conventional commit prefixes: `feat:`, `fix:`, `chore:`, `docs:`, etc.
