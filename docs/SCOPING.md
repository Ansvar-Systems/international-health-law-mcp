# International Health Law MCP Scoping

Generated: 2026-02-22

## Scope baseline

- Tier: Tier 1 (revenue-blocking)
- Driver: NetSecurity medical software provider
- Deployment: Strategy A (Vercel)
- Package: `@ansvar/international-health-law-mcp`
- Repository target: https://github.com/Ansvar-Systems/international-health-law-mcp

## Source inventory

| Source | Authority | Records | Priority |
|---|---|---:|---|
| WHO Constitution | World Health Organization | ~1 | CRITICAL |
| International Health Regulations (2005) | World Health Organization | ~80 articles | CRITICAL |
| WHO Framework Convention on Tobacco Control | World Health Organization | ~40 articles | HIGH |
| ICH Guidelines (Q/S/M/E series) | International Council for Harmonisation | ~100 | CRITICAL |
| IMDRF N-series guidance | International Medical Device Regulators Forum | ~30 | CRITICAL |
| Declaration of Helsinki | World Medical Association | ~37 articles | HIGH |
| Codex Alimentarius standards | FAO and WHO Codex Alimentarius Commission | ~200 standards | MEDIUM |

## Tool backlog

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

## Notes

- Tier-1 baseline is implemented with deterministic seed snapshots and source-backed tool routing.
- Source ingestion is currently offline-safe and reproducible; production expansion should add live source fetchers per upstream format (API, HTML, XML, PDF index parsing where legal).
- Keep all claims evidence-backed and map to official source URLs.
