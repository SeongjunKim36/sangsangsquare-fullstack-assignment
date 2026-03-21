# 백엔드 서버

NestJS + TypeORM + SQLite 기반 API 서버입니다.

## DB

- 기본 DB: `apps/server/data/assignment.sqlite`
- E2E 전용 DB: `apps/server/data/assignment.e2e.<pid>.sqlite`
- 테스트 실행 시 E2E DB만 사용하고, 실행 후 정리합니다.
- 기본 DB 파일은 저장소의 고정 산출물이 아니라, `pnpm seed`로 로컬에서 다시 생성합니다.

## seed 계정

- 관리자: `admin / admin123`
- 사용자: `user1 / user123`
- 사용자: `user2 / user123`
- 사용자: `user3 / user123`

## 주요 스크립트

```bash
pnpm dev
pnpm build
pnpm lint
pnpm seed
pnpm test:e2e
```

- `pnpm seed`는 로컬 SQLite를 초기 상태로 다시 만들고 테스트 계정을 채웁니다.

## 핵심 포인트

- 사용자/관리자 모두 세션 기반 로그인으로 동작합니다.
- 모임 신청 중복은 `UNIQUE(meetingId, userId)`로 막습니다.
- 관리자 선정/탈락 처리는 발표일 이후에만 가능합니다.
- 정원 초과 선정 방지는 트랜잭션 내부에서 검증합니다.
- 입력 문자열은 DTO에서 trim 후 검증합니다.
