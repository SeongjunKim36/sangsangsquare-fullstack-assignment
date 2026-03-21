# 상상단 자기계발 모임 신청 시스템

상상스퀘어의 자기계발 모임 앱 `상상단` 과제를 기준으로 구현한 풀스택 프로젝트입니다.  
사용자는 로그인 전에도 모집 중인 모임 목록과 상세를 둘러볼 수 있고, 로그인 후 관심 있는 모임에 신청할 수 있습니다.

## 1. 로컬 실행 방법

### 환경

- Node.js 22 이상
- pnpm 10.26.1

### 실행

```bash
corepack enable
corepack prepare pnpm@10.26.1 --activate
pnpm install
pnpm --filter server seed
pnpm dev
```

- `pnpm --filter server seed`는 로컬의 `apps/server/data/assignment.sqlite`를 초기 상태로 다시 만들고, 카테고리와 테스트 계정만 채웁니다.
- SQLite 파일은 저장소에 고정 데이터로 커밋하지 않고, seed로 로컬에서 다시 생성하는 방식을 기준으로 합니다.
- 즉 실행 직후 기준 데이터는 `users 4`, `meeting_categories 4`, `meetings 0`, `applications 0`입니다.

- 프론트엔드: `http://localhost:3000`
- 백엔드 API: `http://localhost:4000/api`

### 테스트 계정

- 관리자: `admin / admin123` 
- 사용자: `user1 / user123`
- 사용자: `user2 / user123`
- 사용자: `user3 / user123`

### 검증 명령

```bash
pnpm --filter web lint
pnpm --filter web build
pnpm --filter server lint
pnpm --filter server build
pnpm --filter server exec jest --config ./test/jest-e2e.json --watchman=false --runInBand
```

- GitHub Actions도 같은 기준으로 `web lint/build`, `server lint/build`, `server e2e`를 실행합니다.

### 3분 검증 시나리오

1. `pnpm install`
2. `pnpm --filter server seed`
3. `pnpm dev`
4. `http://localhost:3000`에서 로그인 없이 모집 중인 모임 목록과 상세가 열리는지 확인
5. `http://localhost:3000/login`에서 `admin / admin123`로 로그인하고 `/admin`에서 발표일을 현재 시각보다 조금 뒤로 설정해 모임을 생성
6. 로그아웃 후 메인 목록에서 방금 만든 모임이 공개 목록에 보이는지 확인
7. `user1 / user123`로 로그인해 생성된 모임에 신청
8. 발표일이 지난 뒤 `admin / admin123`로 `/admin`에서 해당 신청을 선정 처리
9. 다시 `user1 / user123`로 로그인해 `/my`에서 선정 결과가 공개되는지 확인

## 2. 구현 중 주요 고민 사항 및 해결 방법

### 2-1. 발표일 전 결과 비공개를 어디서 강제할 것인가

이 과제에서 가장 중요한 규칙은 “발표일 이전에는 선정 결과가 보이지 않아야 한다”는 점이라고 판단했습니다.  
그래서 프론트 UI만 숨기는 방식이 아니라, 서버가 응답 단계에서 상태를 제어하도록 설계했습니다.

- 사용자 목록/상세/내 신청 결과는 서버가 발표일 기준으로 상태를 가공해서 내려줍니다.
- 관리자는 발표일 이후에만 상태를 변경할 수 있게 했습니다.
- 즉, “결과 숨김”과 “조기 선정 방지”를 둘 다 서버 규칙으로 묶었습니다.

### 2-2. 중복 신청과 정원 초과를 어떻게 막을 것인가

중복 신청은 `UNIQUE(meetingId, userId)` 인덱스와 서버 예외 변환으로 처리했습니다.  
정원 초과는 관리자 선정 처리에서만 의미가 있으므로, 해당 유스케이스에만 트랜잭션을 적용했습니다.

- 중복 신청: DB 제약 + `409 Conflict`
- 정원 초과 선정: `SERIALIZABLE` 트랜잭션 내부에서 count 후 차단
- 불필요하게 모든 로직에 트랜잭션을 넓게 두지 않았습니다.

### 2-3. 인증을 선택 구현으로 넣을지 여부

과제는 인증 없이도 가능했지만, 실제 사용자용 서비스라는 전제를 반영해 “둘러보기는 공개, 신청과 결과 확인은 로그인 필요” 구조로 정리했습니다.  
대신 공개 회원가입은 만들지 않고 seed 계정으로만 데모 가능하게 두었습니다.

- 일반 사용자와 관리자 모두 `user` 모델로 통일
- 세션 기반 로그인 사용
- 모임 목록/상세는 공개, 신청/내 결과/관리자 기능만 인증 적용
- 관리자 권한은 별도 guard로 분리

이렇게 하면 `viewer` 같은 임시 개념이 필요 없고, 서비스형 둘러보기 경험과 사용자 식별이 자연스럽게 함께 정리된다고 판단했습니다.

### 2-4. 테스트를 어떻게 신뢰할 수 있게 만들 것인가

초기에는 E2E가 제출용 SQLite를 건드릴 위험이 있었고, 날짜 고정값 때문에 시간이 지나면 깨질 여지가 있었습니다.  
현재는 다음처럼 정리했습니다.

- E2E는 프로세스별 `assignment.e2e.<pid>.sqlite` 전용 파일 사용
- 테스트 종료 후 E2E DB/WAL/SHM 파일 정리
- 날짜는 상대 시간 기반으로 생성해 특정 날짜 이후에도 깨지지 않도록 수정

## 3. 데이터베이스 설계

### 테이블 구조

```text
users
- id
- userId
- name
- password
- role

meeting_categories
- id
- key
- label
- sortOrder
- isActive

meetings
- id
- categoryId
- title
- description
- capacity
- announcementAt

applications
- id
- meetingId
- userId
- status
```

### 관계

- `meeting_categories` 1 : N `meetings`
- `users` 1 : N `applications`
- `meetings` 1 : N `applications`

### 핵심 제약

- `applications(meetingId, userId)` 유니크 인덱스로 중복 신청 방지
- `applications.status`는 `PENDING / SELECTED / REJECTED`
- `meeting.categoryId`, `application.meetingId`, `application.userId`는 외래키로 연결

### 현재 API 구조

#### 인증

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

#### 사용자 API

- `GET /api/meetings`
- `GET /api/meetings/:meetingId`
- `POST /api/meetings/:meetingId/applications`
- `GET /api/me/applications`

`GET /api/meetings`는 현재 모집 중인 모임만 반환합니다.
`GET /api/meetings`, `GET /api/meetings/:meetingId`는 로그인 없이도 접근할 수 있습니다.
`POST /api/meetings/:meetingId/applications`, `GET /api/me/applications`는 로그인 후 사용할 수 있습니다.

#### 관리자 API

- `POST /api/admin/meetings`
- `GET /api/admin/meetings`
- `GET /api/admin/meetings/:meetingId`
- `GET /api/admin/meetings/:meetingId/applications`
- `PATCH /api/admin/meetings/:meetingId/applications/:applicationId`

## 4. 미구현 항목 및 개선 아이디어

### 미구현 항목

- 신청 취소
- 관리자 일괄 선정/탈락 처리
- 페이지네이션
- 실시간 갱신

### 개선 아이디어

- 현재는 발표 시점에 맞춰 프론트에서 쿼리를 다시 무효화하는 방식으로 상태를 맞추고 있습니다. 운영 단계라면 SSE/WebSocket 같은 서버 주도 갱신 방식도 검토할 수 있습니다.
- 현재 E2E는 핵심 시나리오를 커버하지만, 프론트 단위의 UX 검증은 별도로 없습니다.
- 운영 단계라면 SQLite 대신 PostgreSQL로 옮기고 마이그레이션 전략을 두는 편이 적절합니다.

## 5. 과제에 실제로 소요된 시간

- 총 약 8.5시간
- 기존 구현 메모 기준 초기 구현 약 4시간
- 이후 리뷰 반영, 설계 정리, 테스트 안정화, 제출물 정리 추가

## 보충 메모

- 모집 중인 모임 목록과 상세는 로그인 없이도 둘러볼 수 있게 공개했습니다.
- `MeetingCategory`는 enum으로 고정하지 않고 별도 테이블로 유지했습니다.
- 문자열 입력은 서버 DTO에서 trim 후 검증합니다.
- 로그아웃 시 세션 destroy와 쿠키 정리를 함께 수행합니다.
- 사용자별 응답은 세션 사용자 기준 캐시 키로 분리했고, 발표 시점이 지나면 관련 쿼리를 자동 무효화합니다.

## 관련 문서

- [현재 아키텍처 요약](./docs/current-architecture.md)
- [제출 전 필수 개선 계획](./docs/submission-hardening-plan.md)
- [로그인 기반 사용자 통합 계획](./docs/login-based-user-unification-plan.md)


## Readme에 추가할 사항
- 특정 요구사항 추가와 전제조건 변경에 따른 인프라 대응 계획
- 느낀점 작성

너가 한 프로젝트중에 가장 인상적인거?
기술이 부족하면 기술대답
기술을 다했으면 인성어필
인간적인 개발경험
간단한 아이디어로 고객경험 

위기상황과 그 대처 위기질문?

관심있는 기술 스택

hash, jwt, db indexing, 바이너리 트리, b+ tree, hash indexing
컨테이너에 대한 개념

가상화와 컨테이너의 차이점
도커로 컨테이너화해서 과제 제출

실제 서비스 운영
인프라를 직접 관리하고 있나요?
그럼 사용자가 늘어나는 상황에서 어떻게 대응할까요?
vpc - subnet -
보안경험, 인프라 설계 경험
subnet 생성, vpc 생성에 대한 경험
마이그레이션 계획 까지 

패스워드를 노출하면 안되는 이유
단방향 해싱이 가능한 이유

1. 인프라 운영, 트래픽 대응
2. 보안
3. db 인덱싱

가장 중요 -> http와 https의 차이점 

두괄식으로 설명 
http로 패킷을 보냈을떄 받았을때 어떻게 목적지로 도착하는지, 도착한 패킷이 어떤 정보들이 나오는지
osi 7계층
언어마다
node에 대한 이해
각 언어별 속도차이의 이유?
react 이해

클라이언트 개발자에서 웹개발자 전향이유
prisma typeorm 차이 