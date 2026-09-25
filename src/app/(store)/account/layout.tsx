import { requireUser } from "@/lib/auth";
import { AccountNav } from "@/components/account/AccountNav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/account");
  return (
    <main className="wrap" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <div className="eyebrow">My account</div>
      <h1 className="display" style={{ fontWeight: 800, fontSize: "clamp(34px,4.4vw,56px)", lineHeight: 0.98, letterSpacing: "-.035em", margin: "0 0 36px" }}>
        Namaste, {user.name.split(" ")[0]}.
      </h1>
      <div className="acct-layout">
        <AccountNav isAdmin={user.role === "ADMIN"} />
        <div style={{ minWidth: 0 }}>{children}</div>
      </div>
    </main>
  );
}
