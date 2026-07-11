import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_PATHS = ["/login", "/register"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) {
    return true;
  }

  if (pathname === "/manifest.webmanifest" || pathname === "/sw.js") {
    return true;
  }

  if (pathname.startsWith("/api/auth")) {
    return true;
  }

  if (pathname.startsWith("/api/cron")) {
    return true;
  }

  if (pathname === "/api/push/vapid-public-key") {
    return true;
  }

  return false;
}

function hasSessionCookie(request: NextRequest): boolean {
  return Boolean(getSessionCookie(request));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!hasSessionCookie(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
