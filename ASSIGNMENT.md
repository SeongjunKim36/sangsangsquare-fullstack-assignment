# 상상단 단톡방 모임 신청 시스템 - Fullstack Assignment

이 프로젝트는 pnpm workspace를 사용한 모노레포 템플릿입니다.

## 📋 목차

- [프로젝트 구조](#프로젝트-구조)
- [기술 스택](#기술-스택)
- [로컬 실행 방법](#로컬-실행-방법)
- [과제 요구사항](#과제-요구사항)
- [제출 방법](#제출-방법)

---

## 프로젝트 구조

```
fullstack-assignment/
├── apps/
│   ├── server/                    # NestJS 백엔드 API
│   │   ├── src/
│   │   │   ├── config/           # 설정 파일 (env, typeorm)
│   │   │   ├── constants/        # 상수 정의
│   │   │   ├── entity/           # TypeORM 엔티티
│   │   │   ├── modules/          # 기능별 모듈
│   │   │   │   └── app.module.ts
│   │   │   └── main.ts           # 앱 진입점
│   │   ├── data/                 # SQLite 데이터베이스 파일
│   │   └── package.json
│   │
│   └── web/                       # Next.js 프론트엔드
│       ├── app/                   # App Router
│       │   ├── page.tsx          # 메인 페이지
│       │   ├── layout.tsx        # 레이아웃
│       │   └── globals.css       # 전역 스타일
│       ├── lib/                  # 라이브러리 (api-client, react-query, store)
│       └── package.json
│
├── packages/
│   └── shared/                    # 공유 패키지
│       └── src/
│           └── util/             # 유틸리티 함수 (uuid 등)
│
├── pnpm-workspace.yaml            # pnpm workspace 설정
└── package.json                   # 루트 package.json
```

---

## 기술 스택

### 백엔드 (apps/server)

- **프레임워크**: NestJS v11
- **데이터베이스**: SQLite (better-sqlite3)
- **ORM**: TypeORM v0.3.28
- **검증**: class-validator, class-transformer
- **문서화**: Swagger (선택)
- **포트**: 4000 (기본값)

### 프론트엔드 (apps/web)

- **프레임워크**: Next.js 16 (App Router)
- **UI 라이브러리**: React 19
- **스타일링**: Tailwind CSS v4
- **포트**: 3000 (기본값)

### 공통

- **패키지 매니저**: pnpm
- **언어**: TypeScript 5
- **Monorepo**: pnpm workspace

---

## 로컬 실행 방법

### 1. 필수 요구사항

- Node.js 22 이상
- pnpm 설치 (`npm install -g pnpm`)

### 2. 설치

```bash
# 프로젝트 클론
git clone https://github.com/ssqIT/fullstack-assignment
cd fullstack-assignment

# 의존성 설치
pnpm install
```

### 3. 환경 변수 설정

- 백엔드: `apps/server/.env.example` 참고
- 프론트엔드: `apps/web/.env.example` 참고

### 4. 개발 모드 실행

#### 방법 1: 모든 앱 동시 실행

```bash
pnpm dev
```

- 백엔드: http://localhost:4000/api
- 프론트엔드: http://localhost:3000

#### 방법 2: 개별 실행

```bash
# 터미널 1 - 백엔드 서버
pnpm start:dev

# 터미널 2 - 프론트엔드
pnpm dev:web
```

### 5. 빌드 및 프로덕션 실행

```bash
# 빌드
pnpm build

# 프로덕션 실행
pnpm start:server  # 백엔드
pnpm start:web     # 프론트엔드
```

---

## 과제 요구사항

### 📖 과제 배경

상상단에서는 다양한 **단톡방 모임**을 운영하고 있습니다. 모임 주제는 기록, 운동, 독서, 영어 등으로 구성되어 있으며, 고객이 관심 있는 모임에 신청하여 참여하는 방식으로 운영됩니다.

최근 모임 수와 참여자가 늘어나면서, **모임 생성부터 신청, 선정까지의 과정을 효율적으로 관리할 수 있는 시스템**이 필요해졌습니다.

특히 상상단의 모임은 선착순이 아닌, **관리자가 신청자를 검토한 뒤 발표일에 선정 결과를 안내하는 방식**으로 운영되고 있습니다.

이러한 운영 방식을 가정하고, 단톡방 모임 신청 및 선정 과정을 관리할 수 있는 간단한 서비스를 구현해 주세요.

---

### 🎯 해결하고자 하는 문제

#### 관리자 관점

- 단톡방 모임을 생성할 수 있어야 합니다.
- 각 단톡방에는 모집 인원과 발표일이 존재합니다.
- 단톡방에 신청한 사용자 목록을 확인할 수 있어야 합니다.
- 발표일 이후, 신청자 중 일부를 **선정 / 탈락** 처리할 수 있어야 합니다.

#### 사용자 관점

- 현재 모집 중인 단톡방 모임 목록을 확인할 수 있어야 합니다.
- 원하는 단톡방 모임에 신청할 수 있어야 합니다.
- 발표일 이후, 본인의 신청 결과를 확인할 수 있어야 합니다.
- 발표일 이전에는 선정 결과가 보이지 않아야 합니다.

---

### 🔍 구현 범위

#### ✅ 필수 구현

**모임**

- 모임 종류 (`독서`, `운동`, `기록`, `영어`)
- 모임 생성
- 모임 목록 조회
- 모임 상세 조회 (모집 정보, 신청 가능 여부 포함)

**신청 및 선정**

- 모임 신청
- 신청 상태 관리 (`대기`, `선정`, `탈락`)
- 관리자 선정 처리

> **참고**: 관리자/사용자 구분은 **인증 없이도 구현 가능**합니다.
> (예: 요청 파라미터, 간단한 플래그, 분리된 API 등)

---

#### ⭐ 선택 구현

아래 항목은 **선택 사항**이며, 일부만 구현해도 괜찮습니다.

**인증 / 권한**

- 사용자 로그인
- 관리자 / 사용자 권한 분리
- 간단한 인증 방식 (세션, 토큰 등 자유)

**사용자 경험 (UX)**

- 신청 완료 / 실패 상태 처리
- 발표일 이전 결과 숨김 처리
- 신청 불가 상태 UI 처리

**관리 기능 확장**

- 신청 취소
- 선정 결과 일괄 처리
- 모집 인원 초과 선정 방지

---

## 제출 방법

### 제출물

아래 중 **한 가지 방식으로 제출**해 주세요:

1. **GitHub Repository 링크**
2. **zip 파일 제출**

제출은 아래 구글폼을 통해 진행됩니다:

👉 https://forms.gle/iHi8n7MZ7DvBxmGX9

### README 필수 포함 내용

제출 시 README에 다음 내용을 **반드시 포함**해 주세요:

1. **로컬 실행 방법**

   - 환경 설정
   - 설치 및 실행 명령어

2. **구현 중 주요 고민 사항 및 해결 방법** (서술형)

   - 기술적 의사결정 이유
   - 문제 해결 과정

3. **데이터베이스 설계**

   - ERD 또는 테이블 구조 설명
   - Entity 관계 설명

4. **미구현 항목 및 개선 아이디어** (있다면)

   - 시간 관계상 구현하지 못한 기능
   - 추가 개선 방향

5. **과제에 실제로 소요된 시간**
   - 대략적인 작업 시간

---

## 💡 개발 가이드

### 데이터베이스

- **타입**: SQLite (better-sqlite3)
- **위치**: `apps/server/data/assignment.sqlite`
- **설정**: `apps/server/src/config/typeorm.config.ts`
- **동기화**: `synchronize: true` (개발 모드에서 자동 스키마 동기화)

### TypeORM Entity 생성 방법

> ⚠️ **플레이스홀더 파일 안내**
>
> `apps/server/src/entity/_placeholder.entity.ts` 파일은 TypeORM 설정이 정상 동작하도록 유지되는 임시 파일입니다.
> **본인의 Entity를 구현한 뒤 반드시 아래 두 파일을 정리해 주세요:**
>
> 1. `apps/server/src/entity/_placeholder.entity.ts` 파일 **삭제**
> 2. `apps/server/src/entity/index.ts`에서 플레이스홀더 export 줄 **삭제**

1. `apps/server/src/entity/` 폴더에 엔티티 파일 생성
2. `apps/server/src/entity/index.ts`에서 반드시 export 해야 TypeORM이 인식합니다

```typescript
// apps/server/src/entity/meeting.entity.ts 예시
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("meeting")
export class Meeting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;
}

// apps/server/src/entity/index.ts - 플레이스홀더 줄 삭제 후 본인 Entity export 추가
export * from "./meeting.entity";
```

### NestJS Module 생성 방법

1. `apps/server/src/modules/` 폴더에 모듈 생성
2. `app.module.ts`의 imports 배열에 추가

```typescript
// apps/server/src/modules/app.module.ts
import { MeetingModule } from "./meeting/meeting.module";

@Module({
  imports: [
    // ...
    MeetingModule,
  ],
})
export class AppModule {}
```

### 프론트엔드 API 통신

- **API 클라이언트**: `apps/web/lib/api-client/`에 API 함수 작성
- **React Query**: `apps/web/lib/react-query/`에 커스텀 훅 작성
- **상태 관리**: `apps/web/lib/store/`에 Zustand store 작성 (선택)

기본 구조는 이미 세팅되어 있으니 참고하세요!

---

## 도움이 필요하신가요?

- TypeORM: https://typeorm.io/
- NestJS: https://docs.nestjs.com/
- Next.js: https://nextjs.org/docs
- React Query: https://tanstack.com/query/latest

---

**과제 템플릿 저장소**: https://github.com/ssqIT/fullstack-assignment
