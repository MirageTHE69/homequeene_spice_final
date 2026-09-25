import { getSession } from "@/lib/auth";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  const user = s ? { name: s.name, role: s.role } : null;
  return (
    <div style={{ background: "#FFFBF4", color: "#1C1917" }}>
      <SiteHeader user={user} />
      {children}
      <SiteFooter />
    </div>
  );
}
