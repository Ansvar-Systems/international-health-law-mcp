import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

const SERVER_NAME = 'international-health-law-mcp';
const SERVER_VERSION: string = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
).version;
const REPO_URL = 'https://github.com/Ansvar-Systems/international-health-law-mcp';
const FRESHNESS_MAX_DAYS = 45;

export default function handler(req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url ?? '/', `https://${req.headers.host}`);

  if (url.pathname === '/version' || url.searchParams.has('version')) {
    res.status(200).json({
      name: SERVER_NAME,
      version: SERVER_VERSION,
      node_version: process.version,
      transport: ['stdio', 'streamable-http'],
      capabilities: [
        'health_regulations',
        'ich_guidelines',
        'imdrf_guidance',
        'medical_device_requirements',
        'national_mapping',
      ],
      tier: 'silver',
      source_schema_version: '1.0',
      repo_url: REPO_URL,
      report_issue_url: `${REPO_URL}/issues/new`,
    });
    return;
  }

  res.status(200).json({
    status: 'ok',
    server: SERVER_NAME,
    version: SERVER_VERSION,
    uptime_seconds: Math.floor(process.uptime()),
    data_freshness: {
      max_age_days: FRESHNESS_MAX_DAYS,
      note: 'Serving bundled database',
    },
    capabilities: [
      'health_regulations',
      'ich_guidelines',
      'imdrf_guidance',
      'medical_device_requirements',
      'national_mapping',
    ],
    tier: 'silver',
  });
}
