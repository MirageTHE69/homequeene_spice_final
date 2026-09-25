import { STOCK } from "./stock";

export const MARQUEE = ["No added colour", "Ground in our own mill", "Sealed the same day", "FSSAI licensed unit", "39 years, one family"];

export const PROMISES = [
  { no: "01", title: "One unit, no outsourcing", body: "Every gram is blended in our Gorwa facility. No contract blenders." },
  { no: "02", title: "Nothing added for colour", body: "The shade in the pack comes from the spice, not from dye." },
  { no: "03", title: "Ultra-fine grinding", body: "Consistent particle size, so flavour releases evenly in the pan." },
  { no: "04", title: "Sealed the same day", body: "Ground and packed on automated lines to hold the oils and aroma." },
  { no: "05", title: "Reachable people", body: "Support on call, seven days, from the team that makes it." },
];

export const TIMELINE = [
  { year: "1987", title: "RKR Foods begins", body: "Ravneet Kaur Anand leaves insurance underwriting and sets up a small grinding operation in Vadodara." },
  { year: "1990s", title: "The Gorwa unit", body: "Production moves to 4/4 Industrial Estate, Gorwa — still the address printed on every pack today." },
  { year: "2000s", title: "Blends of our own", body: "Garam masala, kitchen king, sambhar and pav bhaji blends are formulated in-house rather than bought in." },
  { year: "2010s", title: "Home Queen on the shelf", body: "The retail brand takes its name and its tagline: har ghar mein swad bharde." },
  { year: "Today", title: "26 SKUs, direct to you", body: "Basic spices, veg and non-veg masalas, ready mixes and kits — online and through retail across India." },
];

export const PROCESS = [
  { no: "01", title: "Sourcing", body: "Whole spice bought by lot and checked before it enters the unit.", img: STOCK.chilliSacks, alt: "Sacks of whole dried red chillies" },
  { no: "02", title: "Cleaning & drying", body: "Stones, stalks and dust removed; moisture brought down to grinding level.", img: STOCK.chilliSorting, alt: "Dried chillies being sorted by hand" },
  { no: "03", title: "Ultra-fine grinding", body: "Ground cool, then sieved to a consistent particle size.", img: STOCK.groundPowders, alt: "Spoons of finely ground spice powders" },
  { no: "04", title: "Blending & sealing", body: "Blended to recipe, then filled and heat-sealed the same day.", img: STOCK.spiceJars, alt: "Blended spices ready for packing" },
];

const INK = "#1C1917", CREAM = "#FFFBF4", RED = "#E4341C", AMB = "#FFB703", GRN = "#167D4E";
export const PARTNER_POINTS = [
  { no: "01", title: "Manufacturer-direct pricing", body: "You buy from the unit that grinds it, so the margin stays with you.", bg: AMB, fg: INK },
  { no: "02", title: "39 years of consistency", body: "Same recipes, same facility, lot-to-lot repeatability your customers notice.", bg: GRN, fg: CREAM },
  { no: "03", title: "Full range in one order", body: "26 SKUs across basic spices, veg and non-veg masalas, ready mixes and gift kits.", bg: RED, fg: CREAM },
  { no: "04", title: "Display-ready packs", body: "Hanging strips and counter units that fit a kirana shelf without rework.", bg: INK, fg: AMB },
  { no: "05", title: "Dispatch from Vadodara", body: "Direct freight across Gujarat and onward to the rest of India.", bg: RED, fg: CREAM },
  { no: "06", title: "A named contact", body: "One person on your account, reachable by phone during working hours.", bg: AMB, fg: INK },
];

export const CONTACT_ROWS = [
  { label: "Manufacturing unit", value: "4/4 Industrial Estate, Gorwa, Vadodara, Gujarat 390016, India" },
  { label: "Phone", value: "+91 8866 911 100", href: "tel:+918866911100" },
  { label: "Email", value: "info@homequeenspices.com", href: "mailto:info@homequeenspices.com" },
  { label: "Support hours", value: "Monday to Saturday, 9:30 am – 7:00 pm IST" },
];

export const RECIPE_TAGS = ["Everyday sabzi", "Non-veg", "Street food", "Starter", "Spice know-how"];
