# 상상단 인프라 아키텍처 다이어그램

## 1. 현재 로컬 실행 구조

```mermaid
flowchart LR
    User["브라우저"]
    Web["Next.js Web<br/>localhost:3000"]
    API["NestJS API<br/>localhost:4000/api"]
    DB["SQLite<br/>apps/server/data/assignment.sqlite"]
    Seed["Seed Script"]
    CI["GitHub Actions"]

    User --> Web
    Web --> API
    API --> DB
    Seed --> DB
    CI --> Web
    CI --> API
```

### 설명 포인트

- 사용자는 Next.js 프론트엔드에 접속
- 프론트는 NestJS API 호출
- API는 SQLite에 직접 접근
- seed가 초기 데이터 준비
- CI는 같은 저장소에서 lint/build/e2e 실행

---

## 2. 공개 조회 흐름

```mermaid
sequenceDiagram
    participant U as Browser
    participant W as Next.js
    participant A as NestJS API
    participant D as SQLite

    U->>W: 메인 페이지 접속
    W->>A: GET /api/meetings
    A->>D: 모집 중인 모임 조회
    D-->>A: meeting rows
    A-->>W: 목록 응답
    W-->>U: 카드 목록 렌더링
```

---

## 3. 신청 흐름

```mermaid
sequenceDiagram
    participant U as Browser
    participant W as Next.js
    participant A as NestJS API
    participant D as SQLite

    U->>W: 로그인 후 신청 버튼 클릭
    W->>A: POST /api/meetings/:id/applications
    A->>D: 중복 신청, 발표일, 기존 상태 검증
    A->>D: application 저장
    D-->>A: 저장 결과
    A-->>W: 신청 성공 응답
    W-->>U: 상태 갱신
```

---

## 4. 관리자 선정 흐름

```mermaid
sequenceDiagram
    participant U as Admin Browser
    participant W as Next.js
    participant A as NestJS API
    participant D as SQLite

    U->>W: 선정 처리
    W->>A: PATCH /api/admin/meetings/:meetingId/applications/:applicationId
    A->>D: 트랜잭션 시작
    A->>D: 발표일, 현재 상태, 현재 선정 수 검증
    A->>D: 상태 변경 저장
    D-->>A: 저장 결과
    A->>D: 트랜잭션 종료
    A-->>W: 처리 성공 응답
    W-->>U: 운영 화면 갱신
```

---

## 5. Docker 실행 구조

```mermaid
flowchart LR
    User["브라우저"]
    Container["Docker Container<br/>web + server"]
    Web["Next.js start"]
    API["NestJS start:prod"]
    DB["SQLite volume<br/>server-data"]

    User --> Container
    Container --> Web
    Container --> API
    API --> DB
```

### 설명 포인트

- 하나의 컨테이너 안에서 프론트와 서버를 함께 실행
- 시작 시 seed 수행
- SQLite 데이터는 volume에 유지

---

## 6. CI 검증 구조

```mermaid
flowchart LR
    Push["Push / PR"]
    Checkout["Checkout"]
    Install["pnpm install --frozen-lockfile"]
    Seed["pnpm --filter server seed"]
    WebLint["web lint"]
    ServerLint["server lint"]
    WebBuild["web build"]
    ServerBuild["server build"]
    E2E["server e2e"]

    Push --> Checkout --> Install --> Seed --> WebLint --> ServerLint --> WebBuild --> ServerBuild --> E2E
```

---

## 7. 운영 확장 가정 구조

```mermaid
flowchart LR
    User["브라우저"]
    CDN["Web Hosting / CDN"]
    Web["Next.js App"]
    API["NestJS API"]
    PG["PostgreSQL"]
    CI["GitHub Actions"]
    Container["Container Image"]

    User --> CDN --> Web
    Web --> API
    API --> PG
    CI --> Container
```

### 설명 포인트

- 가장 먼저 바뀌는 건 SQLite → PostgreSQL
- 필요하면 web / server 배포 단위 분리
- 지금은 과제 범위라 최소 구조를 유지
