# Privacy and Confidentiality

## Executive Summary

This MCP server provides international health law data to AI assistants. When used via Claude API, queries flow through Anthropic's infrastructure. This document explains the data flows and confidentiality implications.

## Data Architecture

### How Data Flows

```
User Query → AI Assistant (Claude/ChatGPT) → MCP Protocol → This Server → SQLite Database
                                                                    ↓
                                                              Tool Response
                                                                    ↓
                                                        AI Assistant → User
```

### What Is Transmitted

When you use this MCP server, the following data is transmitted:

| Data Type | Transmitted To | Purpose |
|-----------|---------------|---------|
| Query text (search terms, topics) | Anthropic (via Claude API) or OpenAI (via ChatGPT) | Tool invocation |
| Tool parameters (source IDs, filters) | MCP server | Database query |
| Tool responses (provisions, search results) | Back through AI provider | Displayed to user |
| Request metadata (timestamps, user agent) | AI provider infrastructure | Logging, abuse prevention |

### What Is NOT Transmitted

- Your local files or documents
- Previous conversation history (except current session context)
- Personal identification data (unless you include it in queries)

## Confidentiality Considerations

### For Healthcare and Regulatory Professionals

If you work in healthcare regulation, pharmaceutical compliance, or medical device regulatory affairs:

#### Risk Assessment

| Risk Level | Scenario | Recommendation |
|------------|----------|----------------|
| **LOW** | General regulatory research ("What does IHR Article 6 require?") | Safe to use via cloud API |
| **LOW** | Framework comparison ("ICH vs IMDRF guidance on SaMD") | Safe to use via cloud API |
| **MEDIUM** | Anonymized product queries ("cybersecurity requirements for Class IIb device") | Acceptable — avoid product identifiers |
| **HIGH** | Client-specific regulatory strategy ("Company X's MDR filing for product Y") | Use local/on-premise deployment |

#### Recommendations

- **Do not** include company names, product names, or trade secrets in queries
- **Do not** describe specific regulatory submissions or ongoing filings
- **Do** use general regulatory questions that cannot identify your client or product
- **Do** consider on-premise deployment for sensitive regulatory work

### On-Premise Deployment

For maximum confidentiality, run this MCP server locally:

```bash
# Install from npm (no cloud dependency)
npm install -g @ansvar/international-health-law-mcp

# Run with local LLM (Ollama, LM Studio, etc.)
international-health-law-mcp
```

With local deployment:
- No query data leaves your machine
- Database is bundled in the npm package
- Works with any MCP-compatible local LLM

## GDPR Considerations

### Roles

- **You** (the user or your organization) are the **Data Controller** for any personal data in your queries
- **Anthropic/OpenAI** is a **Data Processor** when processing your queries
- **This MCP server** processes no personal data — it only serves public legal text

### Data Protection

- The database contains only **publicly available** international legal instruments
- No personal data is stored in or collected by this MCP server
- Query logging is handled by the AI provider (Anthropic, OpenAI) — review their privacy policies

## Query Logging

### What This Server Logs

- **Nothing** — the MCP server does not log queries, tool invocations, or user data
- Vercel deployment logs are subject to Vercel's log retention policy (typically short-lived)

### What AI Providers Log

- **Anthropic**: Review [Anthropic's Privacy Policy](https://www.anthropic.com/privacy). Enterprise customers can negotiate Zero Data Retention (ZDR)
- **OpenAI**: Review [OpenAI's Privacy Policy](https://openai.com/policies/privacy-policy). Enterprise plans offer data processing agreements

## Compliance Checklist

Before using this Tool in a professional regulatory context:

- [ ] Read and acknowledge [DISCLAIMER.md](DISCLAIMER.md)
- [ ] Review your AI provider's privacy policy (Anthropic or OpenAI)
- [ ] Assess whether a Data Processing Agreement (DPA) is needed
- [ ] Decide deployment model (cloud API vs. local) based on confidentiality needs
- [ ] Establish query anonymization procedures for client-related work
- [ ] Train staff on what information is safe to include in queries

## Questions?

For privacy-related questions, contact: hello@ansvar.ai

---

**Last Updated**: 2026-02-22
