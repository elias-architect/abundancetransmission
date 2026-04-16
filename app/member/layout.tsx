import CouncilChat from "@/components/council-chat";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* Member gets Sonnet-quality Council access */}
      <CouncilChat isMember={true} />
    </>
  );
}
