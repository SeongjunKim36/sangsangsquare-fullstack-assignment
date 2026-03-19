# 현재 아키텍처 요약

## 핵심 방향

- 일반 사용자와 관리자를 모두 로그인 기반 `user`로 통일했다.
- `viewer`, `viewerId`, 익명 사용자 흐름은 제거했다.
- 사용자 기능은 세션 사용자 기준으로만 동작한다.
- 관리자 기능은 세션 + 역할 검사로 분리했다.
- `MeetingCategory` 테이블은 유지한다.

## 인증 정책

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

- 공개 회원가입은 제공하지 않는다.
- 테스트 계정은 seed로 제공한다.

## 사용자 API

- `GET /api/meetings`
- `GET /api/meetings/:meetingId`
- `POST /api/meetings/:meetingId/applications`
- `GET /api/me/applications`

모든 사용자 API는 로그인 후 사용한다.

## 관리자 API

- `POST /api/admin/meetings`
- `GET /api/admin/meetings`
- `GET /api/admin/meetings/:meetingId`
- `GET /api/admin/meetings/:meetingId/applications`
- `PATCH /api/admin/meetings/:meetingId/applications/:applicationId`

관리자 API는 `AuthGuard`와 `AdminGuard`를 함께 사용한다.

## 현재 설계 원칙 반영

- 조회 요청은 데이터를 생성하지 않는다.
- 구 엔드포인트와 하위호환용 분기는 남기지 않는다.
- 신청 중복은 `UNIQUE(meetingId, userId)`와 서버 예외 처리로 막는다.
- 선정/탈락 처리는 발표일 이후에만 가능하다.
- 정원 초과 방지를 위해 관리자 상태 변경만 트랜잭션을 유지한다.
- 외부 엔티티 저장소를 직접 끌어다 쓰지 않고 모듈 경계를 명시적으로 유지한다.

## 테스트 계정

- 관리자: `admin / admin123`
- 사용자: `user1 / user123`
- 사용자: `user2 / user123`
- 사용자: `user3 / user123`

## 검증 명령

```bash
pnpm --filter web lint
pnpm --filter web build
pnpm --filter server lint
pnpm --filter server build
pnpm --filter server exec jest --config ./test/jest-e2e.json --watchman=false --runInBand
```

로컬 sandbox 제약으로 E2E는 포트 바인딩 권한이 필요할 수 있다.
