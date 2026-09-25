import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { ActionForm } from "@/components/store/ActionForm";
import { changePassword, updateProfile } from "@/app/actions/account";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function Profile() {
  const user = await requireUser("/account/profile");
  return (
    <div className="split" style={{ gap: 16, alignItems: "start" }}>
      <div className="box">
        <div className="box-title">Profile</div>
        <ActionForm action={updateProfile} resetOnSuccess={false} submitLabel="Save changes" pendingLabel="Saving…">
          <div>
            <label className="label" htmlFor="p-name">Full name</label>
            <input id="p-name" name="name" className="field" defaultValue={user.name} required />
          </div>
          <div>
            <label className="label" htmlFor="p-email">Email</label>
            <input id="p-email" name="email" type="email" className="field" defaultValue={user.email} required />
          </div>
          <div>
            <label className="label" htmlFor="p-phone">Mobile</label>
            <input id="p-phone" name="phone" className="field" defaultValue={user.phone ?? ""} required inputMode="tel" />
          </div>
        </ActionForm>
      </div>
      <div className="box">
        <div className="box-title">Change password</div>
        <ActionForm action={changePassword} submitLabel="Update password" submitClass="btn btn-dark" pendingLabel="Updating…">
          <div>
            <label className="label" htmlFor="c-cur">Current password</label>
            <input id="c-cur" name="current" type="password" className="field" required autoComplete="current-password" />
          </div>
          <div>
            <label className="label" htmlFor="c-new">New password</label>
            <input id="c-new" name="next" type="password" className="field" required minLength={8} autoComplete="new-password" />
          </div>
          <div>
            <label className="label" htmlFor="c-conf">Confirm new password</label>
            <input id="c-conf" name="confirm" type="password" className="field" required minLength={8} autoComplete="new-password" />
          </div>
        </ActionForm>
      </div>
    </div>
  );
}
