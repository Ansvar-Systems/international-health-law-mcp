# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-22

### Added
- Initial release with 7 international health law sources:
  - WHO Constitution (47 provisions)
  - International Health Regulations 2005 (72 provisions including 9 annexes)
  - WHO Framework Convention on Tobacco Control (36 provisions)
  - ICH Harmonised Guidelines — Q, S, E, M series (151 guidelines)
  - IMDRF N-series Medical Device Guidance (28 documents)
  - Declaration of Helsinki (36 articles)
  - Codex Alimentarius Standards (239 standards)
- 11 MCP tools: `search_health_regulation`, `get_provision`, `get_ich_guideline`, `get_imdrf_guidance`, `check_who_status`, `map_to_national_requirements`, `search_medical_device_requirements`, `build_legal_stance`, `list_sources`, `about`, `check_data_freshness`
- Full-text search via SQLite FTS5
- Dual transport: stdio (better-sqlite3) + Vercel Streamable HTTP (@ansvar/mcp-sqlite WASM)
- 96 tests passing
- 6-layer security CI/CD: CodeQL, Semgrep, Trivy, Gitleaks, OSSF Scorecard, drift detection
- Open source documentation: DISCLAIMER.md, PRIVACY.md, SECURITY.md, CONTRIBUTING.md
- Smithery registry configuration
