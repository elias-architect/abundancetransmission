import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MemberClient from "./client";

export const metadata: Metadata = {
  title: "Member Portal — Abundance Transmission",
};

export default async function MemberPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  // Admins can visit member portal too
  return (
    <MemberClient
      userEmail={user.email ?? ""}
      userName={profile?.full_name ?? ""}
      isAdmin={profile?.role === "admin"}
    />
  );
}
