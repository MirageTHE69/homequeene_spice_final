"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toggleWishlist } from "@/app/actions/account";

export function RemoveWish({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      className="link-caps"
      style={{ justifySelf: "start" }}
      disabled={pending}
      onClick={() =>
        start(async () => {
          await toggleWishlist(productId);
          router.refresh();
        })
      }
    >
      {pending ? "Removing…" : "Remove from wishlist ×"}
    </button>
  );
}
