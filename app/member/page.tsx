import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import MemberClient from "./client";

export const metadata: Metadata = {
  title: "Member Portal — Abundance Transmission",
};

export default async function MemberPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { onboarding } = await searchParams;

  // Use service role to bypass RLS
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data: profile } = await admin
    .from("profiles")
    .select("role, full_name, onboarding_complete, newsletter_subscribed")
    .eq("id", user.id)
    .single();

  const needsOnboarding = onboarding === "new" || profile?.onboarding_complete === false;

  return (
    <MemberClient
      userEmail={user.email ?? ""}
      userName={profile?.full_name ?? ""}
      isAdmin={profile?.role === "admin"}
      showOnboarding={needsOnboarding}
      newsletterSubscribed={profile?.newsletter_subscribed ?? true}
    />
  );
}
