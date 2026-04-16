import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/member";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Use service role to read/write profiles without RLS
        const admin = createSupabaseAdmin(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const { data: profile } = await admin
          .from("profiles")
          .select("role, onboarding_complete")
          .eq("id", user.id)
          .single();

        if (!profile) {
          // New user — create profile with member role
          await admin.from("profiles").insert({
            id: user.id,
            role: "member",
            full_name: user.user_metadata?.full_name ?? null,
            onboarding_complete: false,
            newsletter_subscribed: true,
          });
          // Redirect to onboarding
          return NextResponse.redirect(`${origin}/member?onboarding=new`);
        }

        if (profile.role === "admin") {
          return NextResponse.redirect(`${origin}/admin`);
        }

        // Existing member — check if onboarding is done
        if (!profile.onboarding_complete) {
          return NextResponse.redirect(`${origin}/member?onboarding=new`);
        }

        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
