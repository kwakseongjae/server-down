import { ServiceDefinition } from '../types';

export const SERVICES: ServiceDefinition[] = [
  // ──────────────────────────────────────────
  // 클라우드 인프라 (cloud)
  // ──────────────────────────────────────────
  {
    id: 'aws',
    name: 'Amazon Web Services',
    nameKo: 'AWS (아마존 웹 서비스)',
    category: 'cloud',
    logo: '🟠',
    iconSlug: 'amazonaws',
    fetchType: 'aws',
    fetchConfig: { url: 'https://health.aws.amazon.com/health/status' },
    website: 'https://aws.amazon.com',
    statusPage: 'https://health.aws.amazon.com/health/status',
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    nameKo: '클라우드플레어',
    category: 'cloud',
    logo: '🟠',
    iconSlug: 'cloudflare',
    fetchType: 'statuspage',
    fetchConfig: { baseUrl: 'https://www.cloudflarestatus.com' },
    website: 'https://cloudflare.com',
    statusPage: 'https://www.cloudflarestatus.com',
  },
  {
    id: 'gcp',
    name: 'Google Cloud Platform',
    nameKo: 'Google Cloud',
    category: 'cloud',
    logo: '🔵',
    iconSlug: 'googlecloud',
    fetchType: 'gcp',
    fetchConfig: { url: 'https://status.cloud.google.com/incidents.json' },
    website: 'https://cloud.google.com',
    statusPage: 'https://status.cloud.google.com',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    nameKo: '버셀',
    category: 'cloud',
    logo: '▲',
    iconSlug: 'vercel',
    fetchType: 'statuspage',
    fetchConfig: { baseUrl: 'https://www.vercel-status.com' },
    website: 'https://vercel.com',
    statusPage: 'https://www.vercel-status.com',
  },
  {
    id: 'netlify',
    name: 'Netlify',
    nameKo: '넷리파이',
    category: 'cloud',
    logo: '🟩',
    iconSlug: 'netlify',
    fetchType: 'statuspage',
    fetchConfig: { baseUrl: 'https://www.netlifystatus.com' },
    website: 'https://netlify.com',
    statusPage: 'https://www.netlifystatus.com',
  },

  // ──────────────────────────────────────────
  // AI 서비스 (ai)
  // ──────────────────────────────────────────
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    nameKo: '클로드 (Anthropic)',
    category: 'ai',
    logo: '🤖',
    iconSlug: 'anthropic',
    fetchType: 'statuspage',
    fetchConfig: { baseUrl: 'https://status.anthropic.com' },
    website: 'https://claude.ai',
    statusPage: 'https://status.anthropic.com',
  },
  {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    nameKo: 'OpenAI (ChatGPT)',
    category: 'ai',
    logo: '⚫',
    iconSlug: 'openai',
    fetchType: 'statuspage',
    fetchConfig: { baseUrl: 'https://status.openai.com' },
    website: 'https://openai.com',
    statusPage: 'https://status.openai.com',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    nameKo: '구글 제미나이',
    category: 'ai',
    logo: '🔵',
    iconSlug: 'googlegemini',
    fetchType: 'healthcheck',
    fetchConfig: { url: 'https://gemini.google.com', expectedStatus: 200 },
    website: 'https://gemini.google.com',
  },

  // ──────────────────────────────────────────
  // 결제 서비스 (payment)
  // ──────────────────────────────────────────
  {
    id: 'stripe',
    name: 'Stripe',
    nameKo: '스트라이프',
    category: 'payment',
    logo: '💜',
    iconSlug: 'stripe',
    fetchType: 'healthcheck',                           // statuspage.io API 미지원
    fetchConfig: { url: 'https://status.stripe.com', expectedStatus: 200 },
    website: 'https://stripe.com',
    statusPage: 'https://status.stripe.com',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    nameKo: '페이팔',
    category: 'payment',
    logo: '🔵',
    iconSlug: 'paypal',
    fetchType: 'healthcheck',                           // statuspage.io API 비표준
    fetchConfig: { url: 'https://www.paypal.com', expectedStatus: 200 },
    website: 'https://paypal.com',
    statusPage: 'https://www.paypal-status.com',
  },
  {
    id: 'toss-pay',
    name: 'Toss Pay',
    nameKo: '토스페이',
    category: 'payment',
    logo: '🔵',
    iconSlug: 'toss',
    fetchType: 'healthcheck',
    fetchConfig: { url: 'https://toss.im', expectedStatus: 200 },
    website: 'https://toss.im',
  },

  // ──────────────────────────────────────────
  // 개발 도구 (devtools)
  // ──────────────────────────────────────────
  {
    id: 'github',
    name: 'GitHub',
    nameKo: '깃허브',
    category: 'devtools',
    logo: '⚫',
    iconSlug: 'github',
    fetchType: 'statuspage',
    fetchConfig: { baseUrl: 'https://www.githubstatus.com' },
    website: 'https://github.com',
    statusPage: 'https://www.githubstatus.com',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    nameKo: '깃랩',
    category: 'devtools',
    logo: '🟠',
    iconSlug: 'gitlab',
    fetchType: 'healthcheck',                           // statuspage.io /api/v2 미지원
    fetchConfig: { url: 'https://gitlab.com', expectedStatus: 200 },
    website: 'https://gitlab.com',
    statusPage: 'https://status.gitlab.com',
  },
  {
    id: 'npm',
    name: 'npm Registry',
    nameKo: 'npm 레지스트리',
    category: 'devtools',
    logo: '🔴',
    iconSlug: 'npm',
    fetchType: 'statuspage',
    fetchConfig: { baseUrl: 'https://status.npmjs.org' },
    website: 'https://npmjs.com',
    statusPage: 'https://status.npmjs.org',
  },
  {
    id: 'atlassian',
    name: 'Atlassian (Jira/Confluence)',
    nameKo: '아틀라시안 (Jira/Confluence)',
    category: 'devtools',
    logo: '🔵',
    iconSlug: 'atlassian',
    fetchType: 'statuspage',
    fetchConfig: { baseUrl: 'https://status.atlassian.com' },
    website: 'https://atlassian.com',
    statusPage: 'https://status.atlassian.com',
  },

  // ──────────────────────────────────────────
  // 협업·소통 (collaboration)
  // ──────────────────────────────────────────
  {
    id: 'slack',
    name: 'Slack',
    nameKo: '슬랙',
    category: 'collaboration',
    logo: '💬',
    iconSlug: 'slack',
    fetchType: 'slack',                                   // 자체 API 포맷
    fetchConfig: { url: 'https://slack-status.com/api/v2.0.0/current' },
    website: 'https://slack.com',
    statusPage: 'https://slack-status.com',
  },
  {
    id: 'discord',
    name: 'Discord',
    nameKo: '디스코드',
    category: 'collaboration',
    logo: '🟣',
    iconSlug: 'discord',
    fetchType: 'statuspage',
    fetchConfig: { baseUrl: 'https://discordstatus.com' },
    website: 'https://discord.com',
    statusPage: 'https://discordstatus.com',
  },
  {
    id: 'notion',
    name: 'Notion',
    nameKo: '노션',
    category: 'collaboration',
    logo: '📝',
    iconSlug: 'notion',
    fetchType: 'statuspage',
    fetchConfig: { baseUrl: 'https://www.notion-status.com' }, // 실제 도메인
    website: 'https://notion.so',
    statusPage: 'https://www.notion-status.com',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    nameKo: '줌',
    category: 'collaboration',
    logo: '📹',
    iconSlug: 'zoom',
    fetchType: 'statuspage',
    fetchConfig: { baseUrl: 'https://status.zoom.us' },
    website: 'https://zoom.us',
    statusPage: 'https://status.zoom.us',
  },
  {
    id: 'figma',
    name: 'Figma',
    nameKo: '피그마',
    category: 'collaboration',
    logo: '🎨',
    iconSlug: 'figma',
    fetchType: 'statuspage',
    fetchConfig: { baseUrl: 'https://status.figma.com' },
    website: 'https://figma.com',
    statusPage: 'https://status.figma.com',
  },

  // ──────────────────────────────────────────
  // 국내 서비스 (korean)
  // ──────────────────────────────────────────
  {
    id: 'kakao',
    name: 'Kakao',
    nameKo: '카카오',
    category: 'korean',
    logo: '🟡',
    iconSlug: 'kakao',
    fetchType: 'healthcheck',                           // 국외 IP 차단 가능성
    fetchConfig: { url: 'https://www.kakao.com', expectedStatus: 200 },
    website: 'https://www.kakao.com',
    statusPage: 'https://status.kakao.com',
  },
  {
    id: 'naver',
    name: 'Naver',
    nameKo: '네이버',
    category: 'korean',
    logo: '🟢',
    iconSlug: 'naver',
    fetchType: 'healthcheck',
    fetchConfig: { url: 'https://www.naver.com', expectedStatus: 200 },
    website: 'https://naver.com',
  },
  {
    id: 'toss',
    name: 'Toss',
    nameKo: '토스',
    category: 'korean',
    logo: '🔵',
    iconSlug: 'toss',
    fetchType: 'healthcheck',
    fetchConfig: { url: 'https://toss.im', expectedStatus: 200 },
    website: 'https://toss.im',
  },
];

export const STATUS_PRIORITY: Record<string, number> = {
  major_outage: 0,
  partial_outage: 1,
  degraded: 2,
  maintenance: 3,
  unknown: 4,
  operational: 5,
};

export const CATEGORY_ORDER: ServiceDefinition['category'][] = [
  'cloud',
  'ai',
  'payment',
  'devtools',
  'collaboration',
  'korean',
];

export function getServiceById(id: string): ServiceDefinition | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function getServicesByCategory(
  category: ServiceDefinition['category']
): ServiceDefinition[] {
  return SERVICES.filter((s) => s.category === category);
}
