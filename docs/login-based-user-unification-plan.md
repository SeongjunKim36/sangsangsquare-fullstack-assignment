# 로그인 기반 사용자 흐름 통합 계획 (완료)

## 상태

- 완료
- `viewer` 제거
- 일반 사용자/관리자 모두 로그인 기반 `user`로 통일
- 공개 회원가입 제거, seed 계정 기반 테스트로 전환

## 목표

- `viewer` 개념과 관련 코드를 제거한다.
- 일반 사용자와 관리자를 모두 로그인 기반 `user`로 통일한다.
- 사용자 API는 세션 사용자 기준으로만 동작하게 만든다.
- 중복 엔드포인트와 임시 호환 코드를 제거한다.
- 현재 남아 있는 빌드/린트/테스트 실패를 함께 정리한다.

## 유지할 원칙

- `MeetingCategory`는 유지한다.
- 조회 요청은 데이터를 생성하지 않는다.
- 역할은 인증, 사용자 기능, 관리자 기능으로 분리한다.
- 불필요한 레이어는 추가하지 않는다.
- 하위호환성 명목의 구 API와 분기는 남기지 않는다.
- 트랜잭션은 관리자 선정 처리처럼 정말 필요한 곳에만 유지한다.

## 설계 결정

### 1. 사용자 식별 모델

- `viewerId` 기반 익명 식별은 제거한다.
- 일반 사용자도 로그인 후 사용한다.
- 신청자는 세션 사용자다.
- 신청 시 이름을 별도로 받지 않고 로그인 사용자 이름을 사용한다.

### 2. 사용자 API

- `GET /api/meetings`
- `GET /api/meetings/:meetingId`
- `POST /api/meetings/:meetingId/applications`
- `GET /api/me/applications`

위 엔드포인트는 모두 로그인 필요다.

### 3. 관리자 API

- `GET /api/admin/meetings`
- `GET /api/admin/meetings/:meetingId/applications`
- `PATCH /api/admin/meetings/:meetingId/applications/:applicationId`

관리자 상태 변경은 `application` 리소스 자체를 수정하는 의미로 `PATCH` 경로를 단순화한다.

### 4. 인증 정책

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

- 공개 회원가입 API는 제거한다.
- 테스트 계정은 seed로 제공한다.

## 작업 순서

1. 백엔드에서 `viewer` 관련 엔드포인트, 쿼리 파라미터, `findOrCreate` 흐름 제거
2. 사용자 API를 세션 기반으로 재구성
3. 프론트에서 `viewer` 저장소와 관련 훅/쿼리 키 제거
4. 로그인 사용자 기준으로 목록/상세/신청/내 신청 결과 화면 수정
5. 인증 상태 조회를 React Query로 통일
6. 관리자 상태 변경 경로와 타입 정리
7. 인증 가드/세션 타입을 정리해 린트 오류 제거
8. E2E 테스트를 로그인 기반 시나리오로 수정
9. README를 현재 구조와 검증 결과 기준으로 업데이트

## 검증 계획

- `pnpm --filter server build`
- `pnpm --filter web build`
- `pnpm --filter server lint`
- `pnpm --filter web lint`
- `pnpm --filter server exec jest --config ./test/jest-e2e.json --watchman=false --runInBand`
