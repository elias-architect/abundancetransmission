import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Bypasses RLS — safe for server-only middleware
async function getRole(userId: string): Promise<string | null> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=role&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0]?.role ?? null;
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Unauthenticated → login
  if ((path.startsWith("/admin") || path.startsWith("/member")) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role check for /admin
  if (path.startsWith("/admin") && user) {
    const role = await getRole(user.id);
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/member", request.url));
    }
  }

  // Logged-in user hitting /login → redirect to their portal
  if (path === "/login" && user) {
    const role = await getRole(user.id);
    return NextResponse.redirect(new URL(role === "admin" ? "/admin" : "/member", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/member/:path*", "/login"],
};
