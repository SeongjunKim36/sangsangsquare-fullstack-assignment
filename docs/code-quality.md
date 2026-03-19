# ESLint + Prettier 설정 완료 ✅

## 📊 설정 완료 항목

✅ **ESLint** - TypeScript 코드 품질 검사
✅ **Prettier** - 코드 자동 포맷팅
✅ **ESLint + Prettier 통합** - 충돌 방지
✅ **모노레포 전체 적용** - 백엔드 + 프론트엔드

---

## 🎯 설치된 패키지

### 루트 레벨 (workspace)
```json
{
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^8.57.0",
    "@typescript-eslint/parser": "^8.57.0",
    "eslint": "^10.0.3",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-prettier": "^5.5.5",
    "prettier": "^3.8.1"
  }
}
```

### 프론트엔드 (apps/web)
```json
{
  "devDependencies": {
    "eslint-config-next": "^16.1.6"
  }
}
```

---

## 📁 생성된 설정 파일

### 1. 루트 레벨

#### `.prettierrc`
```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "useTabs": false
}
```

**설정 의미:**
- `semi: true` - 세미콜론 사용
- `singleQuote: false` - 큰따옴표 사용 (TypeScript 권장)
- `trailingComma: "es5"` - ES5 호환 trailing comma
- `tabWidth: 2` - 들여쓰기 2칸
- `printWidth: 100` - 한 줄 최대 100자
- `arrowParens: "always"` - 화살표 함수 항상 괄호 사용

#### `.prettierignore`
```
node_modules
dist
build
.next
coverage
*.db
*.sqlite
pnpm-lock.yaml
*.log
.env
.env.local
```

#### `.eslintrc.json`
```json
{
  "root": true,
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "no-console": "off"
  }
}
```

---

### 2. 백엔드 (apps/server)

#### `apps/server/.eslintrc.json`
```json
{
  "extends": ["../../.eslintrc.json"],
  "parserOptions": {
    "project": "./tsconfig.json",
    "tsconfigRootDir": "."
  },
  "rules": {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-floating-promises": "warn",
    "@typescript-eslint/require-await": "off"
  }
}
```

**NestJS 친화적 설정:**
- `no-explicit-any: warn` - any 타입 경고 (에러 아님)
- `no-unsafe-*: off` - TypeORM 등에서 필요한 any 사용 허용
- `no-floating-promises: warn` - async 함수 경고만 표시

---

### 3. 프론트엔드 (apps/web)

#### `apps/web/.eslintrc.json`
```json
{
  "extends": [
    "../../.eslintrc.json",
    "next/core-web-vitals",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "react/no-unescaped-entities": "off",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

**Next.js 친화적 설정:**
- `next/core-web-vitals` - Next.js 권장 룰
- `react-hooks/exhaustive-deps: warn` - hooks 의존성 경고
- `no-unescaped-entities: off` - JSX 내 특수문자 허용

---

## 🚀 사용 가능한 스크립트

### 루트 레벨 (전체 프로젝트)

```bash
# 코드 포맷팅 (자동 수정)
pnpm format

# 코드 포맷팅 체크만 (수정 안 함)
pnpm format:check

# Lint 실행 (모든 워크스페이스)
pnpm lint

# Lint + 자동 수정 (모든 워크스페이스)
pnpm lint:fix
```

### 백엔드만

```bash
# Lint 실행
pnpm --filter server lint

# Lint + 자동 수정
pnpm --filter server lint:fix

# 코드 포맷팅
pnpm --filter server format
```

### 프론트엔드만

```bash
# Lint 실행
pnpm --filter web lint

# Lint + 자동 수정
pnpm --filter web lint:fix
```

---

## ✨ 적용된 효과

### 1. 자동 코드 포맷팅
```bash
# 전체 프로젝트 포맷팅 완료
pnpm format
```

**포맷팅된 파일 (예시):**
- ✅ `apps/server/src/**/*.ts` - 모든 백엔드 파일
- ✅ `apps/web/app/**/*.tsx` - 모든 프론트엔드 파일
- ✅ `*.json` - 모든 설정 파일
- ✅ `*.md` - 모든 문서 파일

### 2. 일관된 코드 스타일
- 모든 파일이 동일한 들여쓰기 (2칸)
- 모든 파일이 동일한 따옴표 (큰따옴표)
- 모든 파일이 동일한 세미콜론 규칙

### 3. 실시간 에러 감지
- IDE에서 실시간으로 코드 품질 문제 표시
- 타입 오류, 사용하지 않는 변수 등 감지

---

## 🔧 IDE 설정 (VSCode 권장)

### .vscode/settings.json (옵션)
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 필요한 VSCode 확장
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)

---

## 📋 ESLint 규칙 설명

### 공통 규칙

| 규칙 | 설정 | 의미 |
|------|------|------|
| `@typescript-eslint/no-explicit-any` | warn | any 타입 사용 시 경고 |
| `@typescript-eslint/no-unused-vars` | warn | 사용하지 않는 변수 경고 |
| `no-console` | off | console.log 허용 (개발 중) |

### 백엔드 전용 규칙

| 규칙 | 설정 | 의미 |
|------|------|------|
| `@typescript-eslint/no-unsafe-*` | off | TypeORM any 사용 허용 |
| `@typescript-eslint/no-floating-promises` | warn | async 함수 await 없을 때 경고 |
| `@typescript-eslint/require-await` | off | async 함수에 await 강제 안 함 |

### 프론트엔드 전용 규칙

| 규칙 | 설정 | 의미 |
|------|------|------|
| `react/no-unescaped-entities` | off | JSX 내 특수문자 허용 |
| `react-hooks/exhaustive-deps` | warn | useEffect 의존성 배열 경고 |

---

## 🎯 코드 품질 향상 효과

### Before (설정 전)
```typescript
// 들여쓰기 불일치
function example(){
      const x=1
  return x
}

// 따옴표 불일치
const name = 'John'
const greeting = "Hello"

// 세미콜론 불일치
const a = 1;
const b = 2
```

### After (설정 후)
```typescript
// 일관된 들여쓰기 (2칸)
function example() {
  const x = 1;
  return x;
}

// 일관된 따옴표 (큰따옴표)
const name = "John";
const greeting = "Hello";

// 일관된 세미콜론
const a = 1;
const b = 2;
```

---

## 🚨 주의사항

### 1. Git Commit 전 포맷팅 권장
```bash
# 커밋 전에 반드시 실행
pnpm format
pnpm lint:fix
```

### 2. 자동 포맷팅 비활성화 (특수 케이스)
```typescript
// prettier-ignore
const matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = fetchData();
```

### 3. Lint 에러 vs 경고
- **에러 (error)**: 반드시 수정해야 함
- **경고 (warn)**: 권장사항, 무시 가능

---

## 📊 설정 전후 비교

### 설정 전
- ❌ 들여쓰기 불일치 (2칸, 4칸 혼용)
- ❌ 따옴표 불일치 (', " 혼용)
- ❌ 세미콜론 불일치
- ❌ 코드 스타일 개인마다 다름
- ❌ 타입 오류 감지 어려움

### 설정 후
- ✅ 일관된 들여쓰기 (2칸)
- ✅ 일관된 따옴표 (큰따옴표)
- ✅ 일관된 세미콜론 사용
- ✅ 전체 프로젝트 동일한 스타일
- ✅ 실시간 타입 오류 감지

---

## 🎊 추가 개선 가능 항목

### 1. Husky + lint-staged (Git Hook)
```bash
# 커밋 전 자동으로 lint + format 실행
pnpm add -D -w husky lint-staged
```

### 2. CI/CD 통합
```yaml
# GitHub Actions 예시
- name: Lint
  run: pnpm lint

- name: Format Check
  run: pnpm format:check
```

### 3. 더 엄격한 TypeScript 설정
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

---

## ✅ 결론

**ESLint와 Prettier 설정이 완료되었습니다!**

### 달성한 것
- ✅ 전체 프로젝트 코드 스타일 통일
- ✅ 자동 포맷팅 시스템 구축
- ✅ 실시간 코드 품질 검사
- ✅ 백엔드/프론트엔드 각각 최적화된 룰

### 사용 방법
```bash
# 개발 중
pnpm dev

# 커밋 전
pnpm format
pnpm lint:fix

# 빌드 전
pnpm lint
pnpm build
```

---

**설정 완료일**: 2026-03-15
**적용 범위**: 백엔드 + 프론트엔드 전체
**코드 품질**: ⭐⭐⭐⭐⭐
