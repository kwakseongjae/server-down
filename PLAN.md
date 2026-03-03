# 서비스 상태 모니터링 사이트 - 설계 계획서

## 개요
"Is It Down Right Now?" 한국판. 주요 서비스들의 상태를 자동으로 수집·정리해 일반인도 쉽게 확인할 수 있는 사이트.

---

## 핵심 설계 원칙: 저비용 + 정합성

### 데이터 수집 전략

#### 1순위: 공식 Status API 활용 (무료, 신뢰도 최고)
대부분의 주요 서비스는 **Atlassian Statuspage.io** 기반으로 운영하며,
`GET /api/v2/summary.json` 공개 엔드포인트를 제공한다.

| 서비스 | Status URL | API 방식 |
|--------|-----------|---------|
| Anthropic/Claude | https://status.anthropic.com | statuspage.io API |
| OpenAI | https://status.openai.com | statuspage.io API |
| Stripe | https://status.stripe.com | statuspage.io API |
| GitHub | https://www.githubstatus.com | statuspage.io API |
| Cloudflare | https://www.cloudflarestatus.com | statuspage.io API |
| Vercel | https://www.vercel-status.com | statuspage.io API |
| Discord | https://discordstatus.com | statuspage.io API |
| Notion | https://status.notion.so | statuspage.io API |
| PagerDuty | https://status.pagerduty.com | statuspage.io API |
| Atlassian (Jira/Confluence) | https://status.atlassian.com | statuspage.io API |
| Slack | https://status.slack.com | statuspage.io API |
| AWS | https://health.aws.amazon.com/health/status | 자체 JSON |
| GCP | https://status.cloud.google.com | 자체 JSON |
| Azure | https://status.azure.com | RSS Feed |
| Kakao | https://status.kakao.com | statuspage.io API |

#### 2순위: 자체 헬스체크 (공식 status 없는 서비스)
- HEAD request → HTTP 200 체크
- 응답 시간 측정 (300ms 이하 정상, 3000ms 이상 이상 징후)
- 대상: Naver, Toss 등 공개 status page 없는 서비스

#### 업데이트 주기
- 공식 API: **1분마다** polling (무료 tier 충분)
- 자체 헬스체크: **2분마다** (rate limiting 고려)
- 예상 API 호출: ~20 services × 1회/분 × 60분 = **1,200회/시** → 완전 무료

---

## 서비스 카테고리

### 1. 클라우드 인프라 (Cloud Infrastructure)
AWS, Google Cloud, Azure, Cloudflare, Vercel, Netlify

### 2. AI 서비스 (AI Services)
Claude (Anthropic), ChatGPT (OpenAI), Google Gemini, GitHub Copilot

### 3. 결제 서비스 (Payment)
Stripe, PayPal, Toss Pay

### 4. 개발 도구 (Developer Tools)
GitHub, GitLab, npm Registry, Docker Hub, Atlassian (Jira/Confluence)

### 5. 협업·소통 (Collaboration)
Slack, Discord, Notion, Zoom, Figma

### 6. 국내 서비스 (Korean Services)
카카오, 네이버, 토스, KakaoTalk, Kakao Map

---

## 기술 스택 (저비용 최적화)

| 영역 | 선택 | 비용 |
|------|------|------|
| Frontend | Next.js 14 App Router + TypeScript + Tailwind CSS | 무료 |
| i18n | next-intl (EN/KO) | 무료 |
| Cache/DB | Upstash Redis (KV) | 무료 (10K req/day) |
| Cron Jobs | Vercel Cron Jobs | 무료 (Hobby 플랜) |
| Hosting | Vercel | 무료 |
| **Total** | | **~$0/월** |

---

## 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                    Vercel Cron                       │
│              (1분마다 /api/cron/update 호출)           │
└──────────────────────┬──────────────────────────────┘
                       │
              ┌────────▼────────┐
              │  Status Fetcher  │
              │                  │
              │ ┌──────────────┐ │
              │ │Statuspage.io │ │
              │ │  API 병렬호출  │ │
              │ └──────────────┘ │
              │ ┌──────────────┐ │
              │ │  AWS / GCP   │ │
              │ │  자체 API    │ │
              │ └──────────────┘ │
              │ ┌──────────────┐ │
              │ │  Health Check │ │
              │ │ (Naver 등)   │ │
              │ └──────────────┘ │
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │  Upstash Redis   │
              │  (캐시 + 히스토리) │
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │   Next.js ISR   │
              │  (60초 revalidate│
              │  + client poll) │
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │   사용자 브라우저  │
              │  (KO/EN 대시보드) │
              └─────────────────┘
```

---

## 프로젝트 구조

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # 메인 대시보드
│   │   └── service/[slug]/
│   │       └── page.tsx          # 서비스 상세 + 인시던트 히스토리
│   └── api/
│       ├── cron/update/route.ts  # Vercel Cron이 호출
│       └── status/route.ts       # 공개 JSON API
├── components/
│   ├── StatusDashboard.tsx
│   ├── CategorySection.tsx
│   ├── ServiceCard.tsx
│   ├── StatusBadge.tsx
│   ├── IncidentTimeline.tsx
│   ├── OverallBanner.tsx         # 전체 상태 한눈에 보기
│   └── LanguageToggle.tsx
├── lib/
│   ├── services/
│   │   ├── registry.ts           # 서비스 목록 정의
│   │   ├── statuspageio.ts       # Statuspage.io API 클라이언트
│   │   ├── aws.ts                # AWS Health API
│   │   ├── gcp.ts                # GCP Status
│   │   └── healthcheck.ts        # 직접 ping
│   ├── cache.ts                  # Upstash Redis 래퍼
│   └── types.ts                  # 공통 타입
└── messages/
    ├── en.json
    └── ko.json
```

---

## 상태 표시 체계

| 상태 | 색상 | 설명 |
|------|------|------|
| 정상 (Operational) | 초록 | 모든 시스템 정상 |
| 성능 저하 (Degraded) | 노랑 | 일부 기능 느림 |
| 부분 장애 (Partial Outage) | 주황 | 일부 서비스 중단 |
| 전체 장애 (Major Outage) | 빨강 | 서비스 전체 중단 |
| 점검 중 (Maintenance) | 파랑 | 예정된 점검 |
| 알 수 없음 (Unknown) | 회색 | 확인 불가 |

---

## UI/UX 핵심 요소

1. **전체 상태 배너**: 상단에 "현재 X개 서비스에 이슈가 있습니다"
2. **카테고리별 그룹**: 탭 또는 섹션으로 분류
3. **실시간 업데이트**: 60초마다 자동 새로고침 (숫자 카운트다운 표시)
4. **인시던트 타임라인**: 각 서비스 클릭 시 최근 30일 이슈 히스토리
5. **마지막 확인 시간**: "3분 전 확인" 표시
6. **공유 버튼**: "카카오톡으로 공유" 등

---

## 구현 순서

1. **프로젝트 셋업** - Next.js 초기화, 의존성 설치, i18n 설정
2. **타입 & 서비스 레지스트리** - 공통 타입, 20+ 서비스 정의
3. **데이터 수집 레이어** - Statuspage.io 클라이언트, AWS/GCP 어댑터, 헬스체크
4. **캐시 레이어** - Upstash Redis 연동
5. **API Routes** - cron 엔드포인트, public status API
6. **UI 컴포넌트** - 대시보드, 서비스 카드, 배지, 타임라인
7. **i18n** - 한국어/영어 메시지
8. **배포 설정** - vercel.json cron 설정

---

## 팀 구성

- **setup-agent**: 프로젝트 초기 셋업 (Next.js, 패키지, 설정)
- **data-layer-agent**: 데이터 수집 레이어 (API 클라이언트들, 캐시)
- **ui-agent**: UI 컴포넌트 및 페이지
- **i18n-api-agent**: i18n 메시지 + API routes + 배포 설정
