# Tools Reference

Complete documentation for all 11 tools provided by the International Health Law MCP server.

## search_health_regulation

Search international health regulations and guidance across all sources.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | Yes | Search query. Supports FTS5 phrase and boolean terms. |
| `sources` | string[] | No | Source IDs to scope the search (e.g. `["WHO_IHR_2005", "ICH_GUIDELINES"]`). |
| `authorities` | string[] | No | Filter by issuing authority. |
| `instrument_types` | string[] | No | Filter by type: `treaty`, `guideline`, `regulation`, `standard`, `ethical_code`. |
| `limit` | number | No | Max results (1-50, default 10). |

**Returns:** Array of matching provisions with source metadata, snippets, and relevance scores.

**Example:** `{ "query": "emergency notification", "sources": ["WHO_IHR_2005"] }`

---

## get_provision

Retrieve a single provision by source and provision ID.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `source` | string | Yes | Source identifier (e.g. `WHO_IHR_2005`). |
| `provision_id` | string | Yes | Provision identifier (e.g. `ART_6`, `Q9(R1)`, `N60`). |
| `include_related` | boolean | No | Include related provision references. |

**Returns:** Full provision text, title, parent section, tags, metadata, and related provisions.

**Example:** `{ "source": "WHO_IHR_2005", "provision_id": "ART_6" }`

---

## get_ich_guideline

Retrieve ICH harmonised guideline content.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `guideline_id` | string | No | Exact or prefix ID (e.g. `Q9(R1)`, `E6`, `M7`). |
| `query` | string | No | Free-text search within ICH guidelines. |
| `limit` | number | No | Max results (1-50, default 10). |
| `include_full_text` | boolean | No | Return full text in each match. |

**Returns:** Matching ICH guideline entries with ID, title, and optionally full text.

**Limitations:** At least one of `guideline_id` or `query` should be provided.

---

## get_imdrf_guidance

Retrieve IMDRF N-series medical device guidance.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `guideline_id` | string | No | Exact or prefix ID (e.g. `N12`, `N60`). |
| `query` | string | No | Free-text search within IMDRF guidance. |
| `limit` | number | No | Max results (1-50, default 10). |
| `include_full_text` | boolean | No | Return full text in each match. |

**Returns:** Matching IMDRF guidance entries with ID, title, and optionally full text.

---

## check_who_status

Check freshness and quality status for WHO instruments.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `source` | string | No | Single source ID to check. |
| `include_non_who` | boolean | No | Include non-WHO sources in output. |

**Returns:** Per-source status including last updated date, item count, and quality assessment.

---

## map_to_national_requirements

Map international provisions to national or regional frameworks.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `source` | string | No | Source ID for mapping target. |
| `provision_id` | string | No | Specific provision to map. |
| `framework` | string | No | National framework (e.g. `EU_MDR_2017_745`). |
| `country` | string | No | Country code (e.g. `US`, `EU`, `JP`). |
| `limit` | number | No | Max results (1-50, default 10). |

**Returns:** Mappings between international instruments and national requirements.

**Limitations:** Mapping data is curated and may not cover all jurisdictions. Currently 6 mappings available.

---

## search_medical_device_requirements

Search medical-device-centric requirements across IMDRF, ICH, and related sources.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | Yes | Medical device requirement query. |
| `sources` | string[] | No | Source IDs to scope the search. |
| `limit` | number | No | Max results (1-50, default 10). |

**Returns:** Device-relevant provisions ranked by relevance, with source metadata.

**Example:** `{ "query": "software as medical device cybersecurity" }`

---

## build_legal_stance

Build a structured evidence-backed stance summary for a regulatory topic.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `topic` | string | Yes | Topic to evaluate (e.g. "incident notification", "SaMD cybersecurity"). |
| `sector` | string | No | Sector filter (e.g. `medical-devices`, `healthcare`). |
| `country` | string | No | Country code for mapping relevance. |
| `framework` | string | No | Target national framework filter. |
| `sources` | string[] | No | Source IDs to prioritize. |
| `max_evidence` | number | No | Number of supporting provisions to include. |

**Returns:** Structured stance with summary, supporting provisions, applicable frameworks, and confidence assessment.

---

## list_sources

List available sources or browse provisions within a source.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `source` | string | No | Source ID to list provisions from. Omit to list all sources. |
| `parent` | string | No | Parent section filter for hierarchical browsing. |

**Returns:** Either a list of sources (with item counts) or a list of provisions within the specified source.

**Example (list all):** `{}`
**Example (browse source):** `{ "source": "WHO_IHR_2005" }`

---

## about

Return server metadata and corpus statistics.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `include_sources` | boolean | No | Include per-source metadata (default: true). |

**Returns:** Server name, version, domain description, item/source/definition counts, tool list, and optionally per-source details.

---

## check_data_freshness

Evaluate source freshness against warning and critical thresholds.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `warn_after_days` | number | No | Warning threshold in days (default 45). |
| `critical_after_days` | number | No | Critical threshold in days (default 120). |
| `include_ok` | boolean | No | Include sources within thresholds. |

**Returns:** Per-source freshness status with days since last update, threshold evaluation, and recommended action.

---

## Source Coverage

| Source ID | Items | Authority |
|-----------|------:|-----------|
| `WHO_CONSTITUTION` | 47 | World Health Organization |
| `WHO_IHR_2005` | 72 | World Health Organization |
| `WHO_FCTC` | 36 | World Health Organization |
| `ICH_GUIDELINES` | 151 | International Council for Harmonisation |
| `IMDRF_N_SERIES` | 28 | International Medical Device Regulators Forum |
| `DECLARATION_HELSINKI` | 36 | World Medical Association |
| `CODEX_ALIMENTARIUS` | 239 | FAO/WHO Codex Alimentarius Commission |
| **Total** | **609** | |
