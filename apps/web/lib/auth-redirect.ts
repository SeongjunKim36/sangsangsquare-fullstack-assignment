import { UserRole } from "./types";

const DEFAULT_USER_PATH = "/";
const DEFAULT_ADMIN_PATH = "/admin";

function sanitizeInternalPath(path: string | null | undefined): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path === "/login") {
    return null;
  }

  return path;
}

export function buildLoginHref(nextPath: string | null | undefined): string {
  const safeNextPath = sanitizeInternalPath(nextPath);

  if (!safeNextPath || safeNextPath === DEFAULT_USER_PATH) {
    return "/login";
  }

  return `/login?next=${encodeURIComponent(safeNextPath)}`;
}

export function resolvePostLoginPath(
  role: UserRole,
  nextPath: string | null | undefined
): string {
  const fallbackPath = role === "ADMIN" ? DEFAULT_ADMIN_PATH : DEFAULT_USER_PATH;
  const safeNextPath = sanitizeInternalPath(nextPath);

  if (!safeNextPath) {
    return fallbackPath;
  }

  if (safeNextPath === DEFAULT_ADMIN_PATH && role !== "ADMIN") {
    return DEFAULT_USER_PATH;
  }

  return safeNextPath;
}
