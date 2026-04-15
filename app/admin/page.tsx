import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminClient from "./client";

export const metadata: Metadata = {
  title: "Admin — Abundance Transmission",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/member");

  return <AdminClient adminEmail={user.email ?? ""} adminName={profile?.full_name ?? "Niko"} />;
}
