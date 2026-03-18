# 프론트엔드 (Next.js)

Next.js 16 (App Router) 기반의 프론트엔드 애플리케이션입니다.

## 📂 프로젝트 구조

```
apps/web/
├── app/                     # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css         # Tailwind CSS
│
├── components/
│   └── sample-list.tsx     # 샘플 컴포넌트 (참고용)
│
└── lib/
    ├── api-client/         # API 클라이언트
    │   ├── base.ts
    │   └── sample.ts
    ├── react-query/        # React Query Hooks
    │   ├── provider.tsx
    │   └── use-samples.ts
    └── store/              # Zustand 상태 관리
        └── use-sample-store.ts
```

---

## 📝 샘플 코드

`components/sample-list.tsx`에 다음을 사용한 예시가 있습니다:

- **React Query**: 서버 상태 관리 (Query + Mutation)
- **API Client**: Axios 기반 HTTP 요청
- **Zustand**: 클라이언트 상태 관리 (선택 사항)
- **Tailwind CSS**: 스타일링

직접 파일을 열어서 참고하세요.

---

## 🔗 백엔드 연결

API 클라이언트는 `http://localhost:4000/api`로 요청합니다.

- `lib/api-client/base.ts`: Axios 설정
- `lib/api-client/sample.ts`: 샘플 API 호출 함수
- `lib/react-query/use-samples.ts`: React Query Hooks

---

## 📦 타입 공유

백엔드와 타입을 공유하려면 `@packages/shared`를 사용하세요:

```typescript
import { Sample, ICreateSampleDto } from "@packages/shared";
```

---

## 🚀 실행 방법

```bash
# 개발 모드
pnpm dev
```

---

## 📚 참고 문서

- [Next.js 공식 문서](https://nextjs.org/docs)
- [React Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
