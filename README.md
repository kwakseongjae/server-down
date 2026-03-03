# 서버 다운? (Server Down?)

> 나만 안 되는 건가요? AWS, Cloudflare, Claude, GitHub 등 주요 서비스의 실시간 상태를 한눈에 확인하세요.

## 🌟 주요 기능

- **실시간 모니터링**: 25개 이상의 주요 서비스 상태를 1분마다 자동 갱신
- **카테고리별 분류**: 클라우드 인프라, AI 서비스, 결제, 개발 도구, 협업, 국내 서비스
- **한국어/영어 지원**: 버튼 하나로 언어 전환
- **인시던트 이력**: 서비스별 최근 장애 이력 및 업데이트 타임라인
- **거의 무료 운영**: Vercel + Upstash Redis 무료 tier로 ~$0/월

## 📊 모니터링 서비스 목록

| 카테고리 | 서비스 |
|---------|--------|
| 클라우드 인프라 | AWS, Cloudflare, GCP, Vercel, Netlify |
| AI 서비스 | Claude (Anthropic), OpenAI, Google Gemini |
| 결제 서비스 | Stripe, PayPal, Toss Pay |
| 개발 도구 | GitHub, GitLab, npm, Atlassian (Jira) |
| 협업·소통 | Slack, Discord, Notion, Zoom, Figma |
| 국내 서비스 | 카카오, 네이버, 토스 |

## 🏗️ 기술 스택

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **i18n**: next-intl (한국어/영어)
- **캐시**: Upstash Redis (없으면 in-memory 자동 fallback)
- **배포**: Vercel (Cron Jobs 포함)
- **데이터 소스**: Statuspage.io 공개 API, AWS Health API, GCP Status API, 직접 헬스체크

## 🚀 로컬 실행

### 1. 클론 및 의존성 설치

```bash
git clone <repo-url>
cd site-status-check
npm install
```

### 2. 환경변수 설정 (선택사항)

```bash
cp .env.example .env.local
```

Upstash Redis 없이도 in-memory 캐시로 동작합니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 접속

### 4. 첫 데이터 수집

개발 서버 실행 후 아래 URL을 브라우저 또는 curl로 호출:

```bash
curl http://localhost:3000/api/cron/update
```

## 🌐 Vercel 배포

### 1. Vercel에 배포

```bash
npx vercel
```

### 2. 환경변수 설정 (선택)

Vercel 대시보드 → Settings → Environment Variables:

| 변수명 | 설명 | 필수 여부 |
|--------|------|---------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | 선택 (없으면 in-memory) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis Token | 선택 |
| `CRON_SECRET` | Cron 엔드포인트 보안 토큰 | 선택 |
| `NEXT_PUBLIC_BASE_URL` | 사이트 베이스 URL | 권장 |

### 3. Cron Job

`vercel.json`에 1분마다 `/api/cron/update`를 호출하도록 설정되어 있습니다.
Vercel Pro 이상에서는 1분 간격 cron 지원. Hobby 플랜은 1시간 간격.

> Hobby 플랜의 경우 외부 cron 서비스(Upstash QStash, cron-job.org 등)를 사용할 수 있습니다.

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # 레이아웃 (Header, Footer)
│   │   ├── page.tsx            # 메인 대시보드
│   │   └── service/[slug]/
│   │       └── page.tsx        # 서비스 상세 페이지
│   └── api/
│       ├── cron/update/        # Vercel Cron 엔드포인트
│       └── status/             # 공개 상태 API
├── components/                 # UI 컴포넌트
├── lib/
│   ├── services/               # 각 서비스별 fetcher
│   ├── cache.ts                # Redis/메모리 캐시
│   └── types.ts                # 공통 타입
└── i18n/                       # next-intl 설정
messages/
├── ko.json                     # 한국어
└── en.json                     # 영어
```

## 📡 공개 API

```
GET /api/status              # 전체 서비스 상태
GET /api/status?service=aws  # 특정 서비스 상태
GET /api/status/aws          # 서비스 상세 (캐시 우선)
```

## 💰 비용

| 서비스 | 플랜 | 비용 |
|--------|------|------|
| Vercel | Hobby | 무료 |
| Upstash Redis | Free (10K req/day) | 무료 |
| 도메인 | 선택사항 | ~$10/년 |
| **합계** | | **~$0/월** |

## 📝 라이선스

MIT
