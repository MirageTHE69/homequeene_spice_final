export function inr(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function priceRange(prices: number[]) {
  if (!prices.length) return "";
  const lo = Math.min(...prices);
  const hi = Math.max(...prices);
  return lo === hi ? inr(lo) : `₹${lo.toLocaleString("en-IN")}–${hi.toLocaleString("en-IN")}`;
}

/** "100 g – 1 kg" for many sizes, "100 g / 200 g" for two or three, the label itself for one. */
export function sizesLabel(labels: string[]) {
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length <= 3) return labels.join(" / ");
  return `${labels[0]} – ${labels[labels.length - 1]}`;
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(d: Date | string) {
  return new Date(d).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseGallery(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PLACED",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
] as const;

export const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

/** The forward path an order moves along; used for the progress tracker. */
export const STATUS_FLOW = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"];

export const PAYMENT_LABEL: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};
