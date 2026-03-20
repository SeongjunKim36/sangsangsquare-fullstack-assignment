# 상상단 단톡방 모임 신청 시스템

사내 모임 신청 과제를 기준으로 구현한 풀스택 프로젝트입니다.  
일반 사용자와 관리자를 모두 로그인 기반 `user`로 통일했고, 결과 공개 시점과 선정 처리 규칙은 서버에서 강제합니다.

## 빠른 실행

```bash
pnpm install
pnpm --filter server seed
pnpm dev
```

- 프론트엔드: `http://localhost:3000`
- 백엔드 API: `http://localhost:4000/api`

## 테스트 계정

- 관리자: `admin / admin123`
- 사용자: `user1 / user123`
- 사용자: `user2 / user123`
- 사용자: `user3 / user123`

## 핵심 규칙

- 사용자는 발표일 전까지 선정/탈락 결과를 볼 수 없습니다.
- 관리자는 발표일 이후에만 신청 상태를 변경할 수 있습니다.
- 동일 사용자의 동일 모임 중복 신청은 DB 제약과 서버 예외 처리로 막습니다.
- 정원 초과 선정은 트랜잭션 내부에서 차단합니다.
- 사용자/관리자 기능 모두 세션 기반 로그인 이후에만 접근할 수 있습니다.

## API 요약

### 인증

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### 사용자 API

- `GET /api/meetings`
- `GET /api/meetings/:meetingId`
- `POST /api/meetings/:meetingId/applications`
- `GET /api/me/applications`

### 관리자 API

- `POST /api/admin/meetings`
- `GET /api/admin/meetings`
- `GET /api/admin/meetings/:meetingId`
- `GET /api/admin/meetings/:meetingId/applications`
- `PATCH /api/admin/meetings/:meetingId/applications/:applicationId`

## 구현 메모

- `MeetingCategory`는 별도 테이블로 유지했습니다.
- 인증은 세션 기반이며, 로그아웃 시 세션 destroy와 쿠키 정리를 함께 수행합니다.
- 문자열 입력은 서버 DTO에서 trim 후 검증합니다.
- E2E 테스트는 제출용 DB가 아니라 별도 SQLite 파일을 사용하고 실행 후 정리합니다.

## 검증 명령

```bash
pnpm --filter web lint
pnpm --filter web build
pnpm --filter server lint
pnpm --filter server build
pnpm --filter server exec jest --config ./test/jest-e2e.json --watchman=false --runInBand
```

현재 위 명령 기준으로 `lint`, `build`, `server e2e`를 모두 통과합니다.

## 문서

- [현재 아키텍처 요약](./docs/current-architecture.md)
- [제출 전 필수 개선 계획](./docs/submission-hardening-plan.md)
- [로그인 기반 사용자 통합 계획](./docs/login-based-user-unification-plan.md)
