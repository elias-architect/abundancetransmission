"use client";
import { usePathname } from "next/navigation";
import CouncilChat from "./council-chat";

// Shown on all public pages — hidden on /member (which has its own member version)
export default function PublicCouncilChat() {
  const pathname = usePathname();
  if (pathname?.startsWith("/member")) return null;
  return <CouncilChat isMember={false} />;
}
