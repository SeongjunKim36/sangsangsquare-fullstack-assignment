# 백엔드 서버 (NestJS)

NestJS 기반의 백엔드 API 서버입니다.

## 📂 프로젝트 구조

```
apps/server/
├── src/
│   ├── config/              # 환경변수, TypeORM 설정
│   ├── constants/           # API prefix, DB 경로 상수
│   ├── entity/              # TypeORM 엔티티
│   │   └── _placeholder.entity.ts  # TypeORM 초기화용 (구현 후 삭제)
│   ├── modules/
│   │   ├── app.module.ts    # 루트 모듈
│   │   └── app.middleware.ts # Global Prefix, Pipes, CORS, Swagger 설정
│   └── main.ts
└── data/
    └── assignment.sqlite    # SQLite DB
```

---

## 🗄️ 데이터베이스

- **타입**: SQLite (better-sqlite3)
- **위치**: `data/assignment.sqlite`
- **설정**: `src/config/typeorm.config.ts`

**중요**: 새로운 엔티티를 만들면 `src/entity/index.ts`에서 반드시 export 해야 합니다.

---

## 🌱 데이터베이스 시딩

데이터베이스 초기 데이터를 생성하려면:

```bash
pnpm seed
```

이 명령어는 다음 데이터를 생성합니다:

### MeetingCategories (모임 카테고리)
- BOOK (독서)
- EXERCISE (운동)
- RECORD (기록)
- ENGLISH (영어)

### Users (사용자)
- **admin** / password: `admin123` - 관리자 계정 (ADMIN)
- **user1** / password: `user123` - 일반 사용자 1 (USER)
- **user2** / password: `user123` - 일반 사용자 2 (USER)

> 💡 **Tip**: seed 명령어는 중복 체크를 하므로 여러 번 실행해도 안전합니다.

---

## 🚀 실행 방법

```bash
# 개발 모드 (루트에서)
pnpm start:dev

# 또는 apps/server 에서 직접
pnpm dev
```

---

## 📋 주요 스크립트

```bash
# 개발 모드 실행
pnpm dev

# 빌드
pnpm build

# 프로덕션 모드 실행
pnpm start:prod

# 데이터베이스 시드 (초기 데이터 생성)
pnpm seed

# 린트
pnpm lint

# 린트 자동 수정
pnpm lint:fix

# 테스트
pnpm test

# E2E 테스트
pnpm test:e2e
```

---

## 🎯 최근 개선사항

### Phase 3-4 설계 개선
1. **Mapper 패턴 적용** - DTO 변환 로직을 Service에서 분리하여 단일 책임 원칙 준수
2. **RESTful 엔드포인트 개선** - 리소스 계층 구조를 명확히 표현
   - 변경 전: `PATCH /api/admin/applications/:applicationId/status`
   - 변경 후: `PATCH /api/admin/meetings/:meetingId/applications/:applicationId/status`
3. **MeetingCategory 테이블 분리** - 하드코딩된 Enum을 데이터베이스 테이블로 분리하여 동적 관리 가능

---

## 📚 참고 문서

- [NestJS 공식 문서](https://docs.nestjs.com/)
- [TypeORM 공식 문서](https://typeorm.io/)
