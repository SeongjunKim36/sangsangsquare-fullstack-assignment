# 웹 앱

Next.js 16 App Router 기반 프론트엔드입니다.

## 역할

- 로그인
- 모집 중인 모임 목록 조회
- 모임 상세 조회 및 신청
- 내 신청 결과 조회
- 관리자 페이지 UI

## 실행

```bash
pnpm --filter server seed
pnpm --filter web dev
```

- 기본 주소: `http://localhost:3000`
- API 기본 주소: `http://localhost:4000/api`

## 데이터 흐름

- API 호출은 `lib/api-client/`에 둡니다.
- 서버 상태는 `lib/react-query/` 훅이 관리합니다.
- 페이지는 query 훅이 제공하는 상태를 소비하는 데 집중합니다.

## 참고

- 제출 관점의 전체 설명은 루트 [README](../../README.md)를 기준으로 봅니다.
