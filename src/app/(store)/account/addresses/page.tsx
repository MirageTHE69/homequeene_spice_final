import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AddressBook } from "@/components/account/AddressBook";

export const metadata: Metadata = { title: "Addresses" };
export const dynamic = "force-dynamic";

export default async function Addresses() {
  const user = await requireUser("/account/addresses");
  const addresses = await db.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] });
  return (
    <div>
      <h2 className="display" style={{ fontWeight: 700, fontSize: 26, letterSpacing: "-.02em", margin: "0 0 16px" }}>
        Addresses
      </h2>
      <AddressBook
        addresses={addresses.map((a) => ({ id: a.id, name: a.name, phone: a.phone, line1: a.line1, line2: a.line2 ?? "", city: a.city, state: a.state, pincode: a.pincode, isDefault: a.isDefault }))}
        defaults={{ name: user.name, phone: user.phone ?? "" }}
      />
    </div>
  );
}
