import { createClient } from "@/lib/supabase/server";

/**
 * Verifies the current session belongs to an admin.
 * Uses the service role key to bypass RLS on the profiles table.
 */
export async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=role&limit=1`,
    {
      headers: {
        apikey:        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0]?.role === "admin" ? user : null;
}
