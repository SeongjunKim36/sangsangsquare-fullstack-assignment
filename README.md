# 상상단 단톡방 모임 신청 시스템

## 구현 관점

이 과제는 **CRUD보다 상태 전이와 운영 규칙 모델링**에 초점을 맞췄습니다.

- 사용자는 **발표 전 결과를 알 수 없고**, 관리자는 **발표일 이후에만 심사를 반영**할 수 있게 했습니다.
- 신청 중복과 정원 초과는 **UI가 아니라 서버와 DB 제약으로 방지**했습니다.
- UI 개선은 보조 요소로 두고, **핵심 도메인 규칙이 먼저 깨지지 않도록** 설계했습니다.

---

## 빠른 실행

```bash
# 1. 의존성 설치
pnpm install

# 2. 데이터 시딩 (사용자, 카테고리)
pnpm seed

# 3. 개발 서버 실행
pnpm dev
```

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:4000/api

**테스트 계정**
- 일반 사용자: `user1 / user123`
- 관리자: `admin / admin123`

---

## 핵심 구현 결정

### 1. 발표일 기준 상태 공개 제어

**문제**: 발표 전에 선정/탈락 결과가 노출되면 안 됨

**해결**:
```typescript
// 서버에서만 날짜 비교 수행
const isAnnouncementPassed = new Date() >= new Date(meeting.announcementAt);

// 발표 전에는 PENDING 외 상태 숨김
const visibleStatus = isAnnouncementPassed || status === 'PENDING'
  ? status
  : null;
```

- 클라이언트 시간 조작 불가능 (서버 시간 기준)
- API 응답 자체에서 상태 제외
- 프론트엔드는 서버가 준 값만 렌더링

### 2. 동시성 제어 (정원 초과 방지)

**문제**: 여러 관리자가 동시에 선정 처리 시 정원 초과 가능

**해결**:
```typescript
@Transaction('SERIALIZABLE')
async updateApplicationStatus(...) {
  // 1. 현재 선정 인원 확인
  const selectedCount = await this.countSelected(meetingId);

  // 2. 정원 초과 체크
  if (selectedCount >= capacity) {
    throw new BadRequestException('정원 초과');
  }

  // 3. 상태 변경
  application.status = SELECTED;
}
```

- **SERIALIZABLE 격리 수준**: 트랜잭션 직렬화
- 정원 체크와 상태 변경을 원자적으로 처리
- 동시 요청도 안전하게 처리

### 3. 중복 신청 방지 (DB 제약)

**문제**: 같은 사용자가 같은 모임에 여러 번 신청

**해결**:
```typescript
// Entity 레벨: Unique Index
@Index(['meetingId', 'userId'], { unique: true })
export class Application { ... }

// Service 레벨: 명시적 검증
const existing = await this.findOne({ meetingId, userId });
if (existing) {
  throw new ConflictException('이미 신청한 모임입니다');
}
```

- DB 제약으로 1차 방어
- 서비스 로직으로 2차 검증
- 프론트엔드는 UX 개선용 체크만

### 4. 상태 전이 규칙 강제

**문제**: 임의의 상태 변경 방지 필요

**해결**:
```typescript
// PENDING → SELECTED/REJECTED만 허용
if (application.status !== ApplicationStatus.PENDING) {
  throw new BadRequestException('PENDING 상태만 변경 가능');
}

// 발표일 체크
if (new Date() < announcementAt) {
  throw new BadRequestException('발표일 이후에만 처리 가능');
}
```

- 상태 전이 규칙을 코드로 명시
- 유효하지 않은 전이 차단

---

## 기술 스택 선택 근거

### 백엔드: NestJS + TypeORM + SQLite

- **NestJS**: DI 컨테이너로 서비스 분리 용이
- **TypeORM**: 트랜잭션과 관계 관리가 명시적
- **SQLite**: 로컬 실행 간편, 제약 조건 설정 가능

### 프론트엔드: Next.js + React Query

- **Next.js 16 (App Router)**: 서버 컴포넌트로 초기 렌더링 최적화
- **React Query**: 서버 상태 캐싱 및 자동 동기화
- **Tailwind CSS**: 빠른 스타일링

### 모노레포: pnpm workspace

- 백엔드/프론트엔드 의존성 공유
- 공통 타입 정의 가능 (`packages/shared`)
- 통합 빌드/배포 스크립트

---

## 데이터베이스 설계

### ERD

```
USERS (id, userId, name, role)
  ↓ 1:N
APPLICATIONS (id, meetingId, userId, status)
  ↓ N:1
MEETINGS (id, categoryId, title, capacity, announcementAt)
  ↓ N:1
MEETING_CATEGORIES (id, key, label, isActive)
```

### 주요 제약 조건

```sql
-- 중복 신청 방지
UNIQUE INDEX (meetingId, userId)

-- 참조 무결성
FOREIGN KEY (meetingId) REFERENCES meetings(id) ON DELETE CASCADE

-- 상태 검증
CHECK (status IN ('PENDING', 'SELECTED', 'REJECTED'))
```

---

## API 설계

### 인증 방식: 세션 기반

```typescript
// 로그인 시 세션 생성
@Post('/auth/login')
async login(@Body() dto: LoginDto, @Session() session) {
  const user = await this.authService.validateUser(dto);
  session.userId = user.id;
  session.role = user.role;
  return { success: true };
}

// 가드로 권한 체크
@UseGuards(AuthGuard)
@Get('/meetings')
async getMeetings(@CurrentUser() user: User) { ... }
```

### 주요 엔드포인트

**사용자 API**
- `GET /api/meetings` - 모임 목록
- `POST /api/meetings/:id/applications` - 신청
- `GET /api/viewer/applications` - 내 신청 결과

**관리자 API**
- `POST /api/admin/meetings` - 모임 생성
- `PATCH /api/admin/applications/:id/status` - 선정/탈락

---

## 프로젝트 구조

```
fullstack-assignment-main/
├── apps/
│   ├── server/                    # NestJS
│   │   ├── src/
│   │   │   ├── entity/            # Meeting, Application, User
│   │   │   ├── modules/
│   │   │   │   ├── auth/          # 인증 (세션, 가드)
│   │   │   │   ├── meetings/      # 사용자 API
│   │   │   │   └── admin/         # 관리자 API
│   │   │   └── config/            # TypeORM 설정
│   │   └── data/assignment.sqlite # SQLite DB
│   │
│   └── web/                       # Next.js
│       ├── app/                   # App Router
│       ├── components/            # UI 컴포넌트
│       └── lib/
│           ├── api-client/        # Axios 기반 API 클라이언트
│           └── react-query/       # Query hooks
│
└── packages/
    └── shared/                   # 공통 타입 (선택)
```

---

## 기술적 의사결정 및 트레이드오프

### SQLite vs PostgreSQL

**선택**: SQLite

**이유**:
- 로컬 실행 간편성 (별도 DB 서버 불필요)
- 파일 기반으로 프로젝트에 포함 가능
- 제약 조건(UNIQUE, FK, CHECK) 모두 지원

**트레이드오프**:
- 동시 쓰기 제한 (SERIALIZABLE 시 성능 저하)
- 대규모 트래픽에는 부적합
- 복잡한 쿼리 최적화 제한적

**실무 고려사항**:
- TypeORM 사용으로 PostgreSQL 전환 시 마이그레이션 용이
- 프로덕션에서는 PostgreSQL + Connection Pooling 권장

### 세션 vs JWT

**선택**: 세션 기반 인증

**이유**:
- 즉시 로그아웃 가능 (서버에서 세션 삭제)
- 상태 관리가 직관적
- XSS 공격 시에도 토큰 탈취 불가능

**트레이드오프**:
- 서버 메모리 사용 (세션 저장)
- 수평 확장 시 세션 공유 필요
- 모바일 앱에는 부적합

**실무 고려사항**:
- Redis Session Store로 확장 가능
- 마이크로서비스 환경에서는 JWT 고려

### SERIALIZABLE vs Optimistic Locking

**선택**: SERIALIZABLE 트랜잭션

**이유**:
- 정원 초과 방지를 DB 레벨에서 보장
- 구현이 명확하고 안전
- 관리자 동시 작업이 빈번하지 않다고 가정

**트레이드오프**:
- 동시 요청 시 성능 저하
- 트랜잭션 충돌 시 재시도 필요
- SQLite는 락 경합이 심함

**실무 고려사항**:
- Optimistic Locking (version 컬럼) 대안
- PostgreSQL의 Row-level Locking 활용

---

## 현재 구현의 제한사항

### 1. 동시성 처리의 성능 저하

**문제**: SERIALIZABLE 격리 수준은 안전하지만, 동시 요청 시 성능이 크게 저하됩니다.

**현실적 해결책**:
```typescript
// Optimistic Locking 방식
@Entity()
class Application {
  @VersionColumn()
  version: number;
}

// 업데이트 시 version 체크
await manager.update(Application,
  { id, version },
  { status: SELECTED, version: version + 1 }
);
```

### 2. 대규모 트래픽 미대응

**문제**: 모임이 1000개 이상일 때 목록 조회가 느려집니다.

**현실적 해결책**:
- **Cursor 기반 페이지네이션**: Offset 대신 마지막 ID 기준 조회
- **무한 스크롤**: React Query의 `useInfiniteQuery`
- **인덱스 추가**: `CREATE INDEX idx_meetings_created_at ON meetings(createdAt DESC)`

### 3. 실시간 업데이트 부재

**문제**: 관리자가 선정 처리해도 사용자는 새로고침해야 결과를 볼 수 있습니다.

**현실적 해결책**:
- **SSE (Server-Sent Events)**: 발표일 이후 자동 갱신
- **React Query의 refetchInterval**: 주기적 폴링 (1분마다)
- **WebSocket**: 양방향 실시간 통신 (오버엔지니어링 가능성)

### 4. 에러 복구 전략 부족

**문제**: 트랜잭션 실패 시 단순 에러 반환만 수행합니다.

**현실적 해결책**:
```typescript
// 지수 백오프 재시도
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

---

## 향후 개선 방향

### 확장 가능성을 고려한 설계

**1. 신청 취소 API**
```typescript
// DELETE /api/meetings/:id/applications/:id
// 제약: 발표일 이전만 가능, 본인 신청만 취소 가능
async cancelApplication(meetingId: number, userId: number) {
  if (isAnnouncementPassed(meeting.announcementAt)) {
    throw new BadRequestException('발표일 이후에는 취소 불가');
  }
  // 상태 전이: PENDING → CANCELLED
}
```

**2. 일괄 선정 처리**
```typescript
// PATCH /api/admin/meetings/:id/applications/batch
async batchUpdateStatus(
  meetingId: number,
  applicationIds: number[],
  status: ApplicationStatus
) {
  // 트랜잭션으로 묶어서 정원 체크 후 일괄 처리
}
```

**3. 알림 시스템**
```typescript
// 이벤트 기반 아키텍처로 분리
@EventEmitter('application.selected')
async notifySelected(application: Application) {
  // 이메일, 푸시, SMS 등 다양한 채널로 발송
  // NestJS의 EventEmitter2 활용
}
```

### 성능 최적화

**1. 모임 목록 캐싱**
```typescript
// Redis 캐싱 (발표일 이후 결과는 변하지 않음)
@Cacheable({ ttl: 300, key: 'meeting-list' })
async findAll() { ... }
```

**2. DB 인덱스 추가**
```sql
-- 발표일 + 상태 복합 인덱스
CREATE INDEX idx_applications_announcement_status
ON applications(meetingId, status)
WHERE announcementAt > NOW();

-- 신청자별 모임 조회 최적화
CREATE INDEX idx_applications_user_created
ON applications(userId, createdAt DESC);
```

**3. N+1 쿼리 해결**
```typescript
// Eager Loading 또는 DataLoader 패턴
@ManyToOne(() => Meeting, { eager: true })
meeting: Meeting;
```

### 개발 경험 개선

**1. API 문서 자동화**
```typescript
// Swagger 통합
@ApiOperation({ summary: '모임 신청' })
@ApiResponse({ status: 201, description: '신청 완료' })
@Post(':id/applications')
async applyToMeeting(...) { ... }
```

**2. E2E 테스트 확대**
```typescript
describe('발표일 기준 상태 공개', () => {
  it('발표 전에는 선정 결과를 볼 수 없어야 함', async () => {
    // 발표일이 미래인 모임 생성
    // 관리자가 선정 처리
    // 사용자 조회 시 status: null 확인
  });
});
```

---

## 구현하지 않은 것 (의도적)

### 1. 신청 취소
- 과제 요구사항에 없음
- 취소 정책이 모호 (발표 전? 후? 정원 재계산?)
- 상태 전이 복잡도 증가 (PENDING → CANCELLED)
- 서버 API는 확장 가능하게 설계 완료

### 2. 이메일/푸시 알림
- 운영 요소이지 핵심 도메인 로직 아님
- 이벤트 기반으로 분리 가능
- 외부 서비스 의존성 추가 (SendGrid, FCM)

### 3. 페이지네이션
- 모임 수가 많지 않다고 가정 (< 100개)
- 필요 시 Query Builder로 쉽게 추가 가능
- 프론트엔드는 무한 스크롤 준비 완료 (React Query)

---

## 테스트

```bash
# E2E 테스트 (트랜잭션 격리 수준)
cd apps/server && pnpm test:e2e

# Lint + Format
pnpm lint
pnpm format
```

---

## 개발 일정

**총 소요 시간: 약 4시간**

- 설계 (30분): ERD, API 명세, 상태 전이도
- 백엔드 (1시간 30분): Entity, Service, 트랜잭션 처리
- 프론트엔드 (1시간 30분): React Query 연동, UI 구현
- 코드 정리 (30분): ESLint, Prettier, 문서화

---

## 추가 구현 사항 (과제 범위 외)

- ✅ 다크모드 (next-themes)
- ✅ React Query 상태 관리
- ✅ ESLint + Prettier
- ✅ 키보드 단축키

**의도**: 실무 프로젝트처럼 보이도록 최소한의 DX 개선만 추가

---

## 상세 문서

- [과제 설계사항](./docs/design.md) - ERD, API 명세 상세
- [백엔드 구현](./docs/backend.md) - 트랜잭션, 에러 처리
- [UI/UX 개선](./docs/ui-ux.md) - 프론트엔드 개선 사항
- [코드 품질](./docs/code-quality.md) - ESLint, Prettier 설정

---

**구현 완료일**: 2026-03-15
**실행 환경**: Node.js 22, pnpm 9
