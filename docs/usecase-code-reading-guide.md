# 유즈케이스별 코드 읽기 가이드

이 문서는 `ASSIGNMENT.md`를 기준으로 현재 구현을 따라가며, 각 유즈케이스가 어떤 파일과 코드로 연결되는지 빠르게 파악하기 위한 참고용 문서입니다.

목표는 두 가지입니다.

1. 과제 요구사항이 코드에서 어디에 구현되었는지 찾기
2. 각 코드가 어떤 의도로 작성되었는지 흐름 단위로 읽기

## 먼저 보면 좋은 순서

1. `ASSIGNMENT.md`
2. `apps/server/src/entity/*`
3. `apps/server/src/modules/meetings/meetings.service.ts`
4. `apps/server/src/modules/admin/admin.service.ts`
5. `apps/server/src/modules/meetings/*.controller.ts`
6. `apps/server/src/modules/auth/*`
7. `apps/web/lib/api-client/*`
8. `apps/web/lib/react-query/*`
9. `apps/web/app/*`
10. `apps/server/test/transaction.e2e-spec.ts`

이 순서로 읽으면 "요구사항 -> 도메인 모델 -> 서버 규칙 -> 화면 연결 -> 검증" 흐름이 비교적 자연스럽게 보입니다.

## 전체 설계 의도

- 공개 영역과 인증 영역을 분리했습니다.
  - 모임 목록/상세는 누구나 볼 수 있습니다.
  - 신청, 내 신청 결과, 관리자 기능은 로그인 후 사용할 수 있습니다.
- 핵심 규칙은 서버가 책임집니다.
  - 발표일 이전 신청 가능
  - 발표일 이전 선정/탈락 처리 금지
  - 중복 신청 금지
  - 정원 초과 선정 금지
- 프론트는 서버가 계산한 상태를 표시하는 쪽에 가깝고, 시간 경계 변화는 별도 invalidation 훅으로 따라갑니다.

## 1. 모임 도메인 모델

### 먼저 볼 파일

- `apps/server/src/entity/meeting.entity.ts`
- `apps/server/src/entity/application.entity.ts`
- `apps/server/src/entity/user.entity.ts`
- `apps/server/src/entity/meeting-category.entity.ts`

### 의도

- `Meeting`
  - 모임 자체를 표현합니다.
  - 과제 요구사항의 `종류`, `제목`, `설명`, `모집 인원`, `발표일`을 담습니다.
- `Application`
  - 사용자와 모임 사이의 신청 관계입니다.
  - `(meetingId, userId)` 유니크 인덱스로 중복 신청을 DB 레벨에서 막습니다.
- `User`
  - 일반 사용자와 관리자를 모두 담습니다.
  - 이번 구현에서는 `viewer` 같은 임시 개념 대신 로그인 사용자 모델 하나로 통일했습니다.
- `MeetingCategory`
  - 고정 enum 대신 카테고리 테이블로 관리합니다.
  - 실제 서비스 확장 가능성을 열어둔 선택입니다.

## 2. 인증과 권한 경계

### 먼저 볼 파일

- `apps/server/src/modules/auth/auth.controller.ts`
- `apps/server/src/modules/auth/auth.service.ts`
- `apps/server/src/modules/auth/auth.guard.ts`
- `apps/server/src/modules/auth/admin.guard.ts`
- `apps/server/src/modules/auth/current-user.decorator.ts`
- `apps/server/src/modules/app.middleware.ts`
- `apps/web/lib/api-client/base.ts`
- `apps/web/lib/react-query/auth.ts`
- `apps/web/app/login/page.tsx`

### 의도

- 세션 기반 로그인으로 구현했습니다.
- 사용자와 관리자를 같은 로그인 모델로 다루되, 관리자 기능만 `AdminGuard`로 제한합니다.
- 프론트는 `withCredentials: true`로 세션 쿠키를 보내고, `useCurrentUser()`로 현재 로그인 상태를 확인합니다.

### 읽는 포인트

- `auth.controller.ts`
  - 로그인/로그아웃/`/auth/me` 엔드포인트
- `auth.guard.ts`
  - 보호 API 진입 전에 세션 사용자 확인
- `admin.guard.ts`
  - 관리자 권한 확인
- `login/page.tsx`
  - 로그인 폼, 성공 후 라우팅

## 3. 관리자: 모임 생성

### 유즈케이스

- 관리자가 모임 종류, 제목, 설명, 모집 인원, 발표일을 입력해 새 모임을 만든다.

### 먼저 볼 파일

- `apps/web/app/admin/page.tsx`
- `apps/web/lib/api-client/admin.ts`
- `apps/web/lib/react-query/admin.ts`
- `apps/server/src/dto/create-meeting.dto.ts`
- `apps/server/src/modules/admin/admin.controller.ts`
- `apps/server/src/modules/admin/admin.service.ts`

### 의도

- 생성 화면은 관리자 화면에 모여 있습니다.
- 서버는 단순 저장만 하지 않고 다음을 검증합니다.
  - 유효한 모임 종류인지
  - 발표일이 현재보다 미래인지

### 읽는 순서

1. `admin/page.tsx`
   - 폼 상태와 제출 동선
2. `react-query/admin.ts`
   - mutation 훅
3. `api-client/admin.ts`
   - 실제 API 호출
4. `admin.controller.ts`
   - 라우트 진입점
5. `admin.service.ts#createMeeting`
   - 실제 규칙 검증과 저장

## 4. 사용자: 모집 중인 모임 목록 보기

### 유즈케이스

- 사용자가 현재 모집 중인 모임 목록을 본다.

### 먼저 볼 파일

- `apps/web/app/page.tsx`
- `apps/web/components/meeting-list.tsx`
- `apps/web/components/meeting-card.tsx`
- `apps/web/lib/react-query/meetings.ts`
- `apps/web/lib/api-client/meetings.ts`
- `apps/server/src/modules/meetings/meetings.controller.ts`
- `apps/server/src/modules/meetings/meetings.service.ts`
- `apps/server/src/modules/meetings/mappers/meeting.mapper.ts`

### 의도

- 홈 화면은 "현재 모집 중"인 모임만 보여줍니다.
- 서버가 `announcementAt > now` 조건으로 모집 중 목록을 의미 있게 정의합니다.
- 로그인 사용자는 같은 목록에서도 자신의 신청 상태를 같이 볼 수 있습니다.

### 읽는 순서

1. `page.tsx`
   - 홈 화면의 entry
2. `meeting-list.tsx`
   - 목록 조회와 상태 분기
3. `meeting-card.tsx`
   - 카드 UI
4. `react-query/meetings.ts#useMeetings`
   - 리스트 query
5. `api-client/meetings.ts#getMeetings`
   - API 호출
6. `meetings.controller.ts#getMeetings`
   - 세션 사용자 여부를 optional 하게 해석
7. `meetings.service.ts#findAll`
   - 모집 중 필터, 신청 수 계산, 내 신청 상태 계산
8. `meeting.mapper.ts#toListResponse`
   - 프론트 응답 shape 정리

## 5. 사용자: 모임 상세 보기

### 유즈케이스

- 사용자가 모임 상세를 보고 신청 가능 여부와 발표일을 확인한다.

### 먼저 볼 파일

- `apps/web/app/meetings/[id]/page.tsx`
- `apps/web/lib/react-query/meetings.ts`
- `apps/server/src/modules/meetings/meetings.controller.ts`
- `apps/server/src/modules/meetings/meetings.service.ts`
- `apps/server/src/modules/meetings/mappers/meeting.mapper.ts`

### 의도

- 상세는 공개 영역입니다.
- 다만 로그인 사용자라면 자신의 신청 상태도 함께 내려받아, "신청하기 / 신청 완료 / 모집 마감" 버튼 상태를 서버 기준으로 렌더링합니다.

### 읽는 포인트

- `page.tsx`
  - 상세 정보 렌더링
  - 신청 CTA 분기
  - 비로그인 사용자의 로그인 유도 카드
- `meetings.service.ts#findOne`
  - `canApply`
  - `myApplicationStatus`
  - `myApplication`
  - `applicantCount`
  를 한 번에 계산합니다.

## 6. 사용자: 모임 신청

### 유즈케이스

- 로그인한 사용자가 모임에 신청한다.

### 먼저 볼 파일

- `apps/web/app/meetings/[id]/page.tsx`
- `apps/web/lib/react-query/meetings.ts`
- `apps/server/src/modules/meetings/meetings.controller.ts`
- `apps/server/src/modules/meetings/meetings.service.ts`
- `apps/server/src/entity/application.entity.ts`

### 의도

- 신청은 로그인 사용자만 가능합니다.
- 중복 신청은 프론트가 아니라 DB 유니크 인덱스가 최종적으로 막습니다.
- 발표일이 지나면 신청할 수 없습니다.

### 읽는 순서

1. 상세 화면의 신청 버튼과 확인 Dialog
2. `useApplyToMeeting`
3. `meetings.controller.ts#applyToMeeting`
4. `meetings.service.ts#applyToMeeting`
5. `application.entity.ts`
   - `(meetingId, userId)` unique index

## 7. 관리자: 신청자 목록 보기

### 유즈케이스

- 관리자가 특정 모임의 신청자 목록과 상태를 본다.

### 먼저 볼 파일

- `apps/web/app/admin/page.tsx`
- `apps/web/lib/react-query/admin.ts`
- `apps/server/src/modules/admin/admin.controller.ts`
- `apps/server/src/modules/admin/admin.service.ts`

### 의도

- 관리자 화면은 운영 관점의 요약 통계와 신청자 목록을 함께 보여줍니다.
- 서버는 신청자 목록을 사용자 이름과 신청 시각까지 포함해 내려줍니다.

### 읽는 포인트

- `admin.service.ts#findAllMeetings`
  - 목록용 통계 집계
- `admin.service.ts#findApplications`
  - 신청자 목록 조회

## 8. 관리자: 선정/탈락 처리

### 유즈케이스

- 발표일 이후 관리자가 신청자를 선정 또는 탈락 처리한다.

### 먼저 볼 파일

- `apps/web/app/admin/page.tsx`
- `apps/web/lib/react-query/admin.ts`
- `apps/server/src/dto/update-application-status.dto.ts`
- `apps/server/src/modules/admin/admin.controller.ts`
- `apps/server/src/modules/admin/admin.service.ts`
- `apps/server/test/transaction.e2e-spec.ts`

### 의도

- 선정/탈락은 `PENDING` 상태에서만 바꿀 수 있습니다.
- 발표일 이전에는 처리할 수 없습니다.
- 선정은 정원 초과를 막아야 하므로 트랜잭션 안에서 처리합니다.

### 읽는 순서

1. `admin/page.tsx`
   - 버튼 동선과 선택된 모임 UI
2. `react-query/admin.ts`
   - 상태 변경 mutation
3. `admin.controller.ts`
   - RESTful endpoint
4. `admin.service.ts#updateApplicationStatus`
   - 발표일 검증
   - 이미 처리된 신청 차단
   - 정원 초과 방지
5. `transaction.e2e-spec.ts`
   - 동시 선정 시나리오 검증

## 9. 사용자: 내 신청 결과 확인

### 유즈케이스

- 사용자가 자신이 신청한 모임 목록과 결과를 확인한다.

### 먼저 볼 파일

- `apps/web/app/my/page.tsx`
- `apps/web/components/login-required-state.tsx`
- `apps/web/components/application-status-badge.tsx`
- `apps/web/lib/react-query/meetings.ts`
- `apps/server/src/modules/meetings/me.controller.ts`
- `apps/server/src/modules/meetings/meetings.service.ts`
- `apps/server/src/modules/meetings/mappers/meeting.mapper.ts`

### 의도

- `/my`는 로그인 사용자의 전용 화면입니다.
- 발표일 전에는 결과를 숨기고, 발표일 후에만 선정/탈락을 보여줍니다.

### 읽는 포인트

- `my/page.tsx`
  - 로그인 필요 상태
  - 빈 상태
  - 결과 카드 렌더링
- `me.controller.ts`
  - `/me/applications`
- `meetings.service.ts#getMyApplications`
  - 발표 전 상태 숨김 로직
- `meeting.mapper.ts#toMyApplicationResponse`
  - 화면용 응답 shape

## 10. 발표 시점이 지나면 화면 상태 갱신

### 유즈케이스

- 사용자가 페이지를 열어둔 상태에서 발표 시점이 지나면 결과 공개/마감 상태가 바뀌어야 한다.

### 먼저 볼 파일

- `apps/web/lib/use-announcement-invalidation.ts`
- `apps/web/lib/react-query/meetings.ts`

### 의도

- 시간 경계 규칙은 서버가 계산하지만, 프론트에 열린 탭이 stale 한 상태로 남지 않도록 다음 발표 시점에 query를 무효화합니다.

### 읽는 포인트

- `useAnnouncementInvalidation`
  - 가장 가까운 `announcementAt`를 찾아 invalidate 시점 예약
- `react-query/meetings.ts`
  - 목록/상세/내 신청 query에 연결

## 11. 시드 데이터와 실행 시작점

### 먼저 볼 파일

- `apps/server/src/scripts/seed.ts`
- `apps/server/src/config/typeorm.config.ts`
- `apps/server/src/modules/app.module.ts`
- `apps/server/src/modules/app.middleware.ts`

### 의도

- 과제 검증을 빠르게 할 수 있도록 카테고리와 데모 계정을 seed로 제공합니다.
- DB는 로컬 SQLite를 사용하고, 테스트와 실행 환경 모두 현재 repo 안에서 재현 가능하게 맞춰둡니다.

## 12. 테스트로 보면 좋은 흐름

### 먼저 볼 파일

- `apps/server/test/transaction.e2e-spec.ts`

### 왜 중요한가

이 파일 하나에 과제의 핵심 시나리오가 많이 모여 있습니다.

- 사용자 신청
- 중복 신청 방지
- 발표 전 관리자 처리 차단
- 발표 후 결과 공개
- 공개 목록/상세
- 비로그인 신청 차단
- 정원 초과 선정 방지

### 추천 읽는 순서

1. `User Flow`
2. `Application Status Update with Pessimistic Lock`
3. 하단 helper 함수

helper 함수까지 같이 보면 "어떤 조건으로 테스트 데이터를 만들었는지"가 같이 보여서 서비스 규칙을 더 빨리 이해할 수 있습니다.

## 마지막으로 보면 좋은 것

### 프론트에서 상태가 왜 이렇게 보이는지 헷갈릴 때

- `apps/web/lib/types.ts`
- `apps/server/src/modules/meetings/mappers/meeting.mapper.ts`

이 두 파일을 같이 보면 응답 shape와 화면 타입이 어떻게 맞물리는지 금방 이해할 수 있습니다.

### 실제 구현이 과제 요구사항을 얼마나 커버하는지 보고 싶을 때

- `ASSIGNMENT.md`
- `apps/server/test/transaction.e2e-spec.ts`
- `apps/web/app/page.tsx`
- `apps/web/app/meetings/[id]/page.tsx`
- `apps/web/app/my/page.tsx`
- `apps/web/app/admin/page.tsx`

이 다섯 군데를 같이 보면 "요구사항 -> 화면 -> 서버 규칙 -> 테스트"가 한 번에 연결됩니다.
