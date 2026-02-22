# Data Coverage

## Overview

| Metric | Value |
|--------|-------|
| Status | `full_corpus_ingested` |
| Total Sources | 7 |
| Total Items | 609 |
| Total Definitions | 3 |
| Total Mappings | 6 |
| Last Generated | 2026-02-22 |

## Sources

| ID | Name | Authority | Effective Date | Items | Definitions | Official URL |
|---|---|---|---|---:|---:|---|
| `WHO_CONSTITUTION` | Constitution of the World Health Organization | World Health Organization | 1948-04-07 | 47 | 0 | https://www.who.int/about/governance/constitution |
| `WHO_IHR_2005` | International Health Regulations (2005) | World Health Organization | 2007-06-15 | 72 | 1 | https://www.who.int/health-topics/international-health-regulations |
| `WHO_FCTC` | WHO Framework Convention on Tobacco Control | World Health Organization | 2005-02-27 | 36 | 0 | https://fctc.who.int/resources/publications/i/item/9241591013 |
| `ICH_GUIDELINES` | ICH Harmonised Guidelines (Q, S, E, M series) | International Council for Harmonisation | - | 151 | 2 | https://www.ich.org/page/ich-guidelines |
| `IMDRF_N_SERIES` | IMDRF N-series Medical Device Guidance | International Medical Device Regulators Forum | - | 28 | 0 | https://www.imdrf.org/documents |
| `DECLARATION_HELSINKI` | World Medical Association Declaration of Helsinki | World Medical Association | 1964-06-01 | 36 | 0 | https://www.wma.net/policies-post/wma-declaration-of-helsinki-ethical-principles-for-medical-research-involving-human-subjects/ |
| `CODEX_ALIMENTARIUS` | Codex Alimentarius Standards and Codes | FAO and WHO Codex Alimentarius Commission | - | 239 | 0 | https://www.fao.org/fao-who-codexalimentarius/codex-texts/list-standards/en/ |

## Data Quality

### Completeness

| Source | Expected Items | Parsed Items | Status |
|--------|----------------|--------------|--------|
| `WHO_CONSTITUTION` | 47 | 47 | Complete |
| `WHO_IHR_2005` | 72 | 72 | Complete |
| `WHO_FCTC` | 36 | 36 | Complete |
| `ICH_GUIDELINES` | 151 | 151 | Complete |
| `IMDRF_N_SERIES` | 28 | 28 | Complete |
| `DECLARATION_HELSINKI` | 36 | 36 | Complete |
| `CODEX_ALIMENTARIUS` | 239 | 239 | Complete |

### Known Limitations

- ICH and IMDRF content is indexed from official web endpoints and may change without versioned release tags on all entries.
- Codex indexing captures registry metadata and links; full standard text extraction is not performed in this corpus snapshot.

## Update Schedule

| Source | Update Frequency | Last Checked |
|--------|------------------|--------------|
| `WHO_CONSTITUTION` | on_change | 2026-02-22 |
| `WHO_IHR_2005` | on_change | 2026-02-22 |
| `WHO_FCTC` | on_change | 2026-02-22 |
| `ICH_GUIDELINES` | on_change | 2026-02-22 |
| `IMDRF_N_SERIES` | on_change | 2026-02-22 |
| `DECLARATION_HELSINKI` | on_change | 2026-02-22 |
| `CODEX_ALIMENTARIUS` | monthly | 2026-02-22 |

To check for updates:

```bash
npm run check-updates
```
