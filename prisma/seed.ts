import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const img = (f: string) => `/images/products/${f}`;
const stock = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`;
const TEXTURE = stock("photo-1581600140682-d4e68c8cde32");
const POWDERS = stock("photo-1506368249639-73a05d6f6488");

const INK = "#1C1917", CREAM = "#FFFBF4", RED = "#E4341C", AMB = "#FFB703", GRN = "#167D4E";

const categories = [
  { slug: "basic-spices", name: "Basic Spices", short: "Basic", bg: AMB, fg: INK, image: img("kashmiri-chilli.webp"), sortOrder: 1,
    description: "Single spices, ground fine in our own unit." },
  { slug: "veg-masalas", name: "Veg Masalas", short: "Veg", bg: GRN, fg: CREAM, image: img("cumin-coriander.png"), sortOrder: 2,
    description: "House blends for sabzi, dal, chaat and street food." },
  { slug: "non-veg-masalas", name: "Non-Veg Masalas", short: "Non-Veg", bg: RED, fg: CREAM, image: img("meat-masala.png"), sortOrder: 3,
    description: "Blends built for meat and chicken curries." },
  { slug: "combo-kits", name: "Combo Kits", short: "Kit", bg: INK, fg: AMB, image: img("curry-spice-kit.webp"), sortOrder: 4,
    description: "The whole shelf in one box — for a new home or a gift." },
  { slug: "ready-mixes", name: "Ready Mixes", short: "Ready Mix", bg: AMB, fg: INK, image: img("paneer-tikka-ready-mix.webp"), sortOrder: 5,
    description: "Marinades and mixes — add, cook, done." },
];

type V = [label: string, price: number, compareAt: number, stock?: number];
type P = {
  slug: string; name: string; cat: string; summary: string; image?: string; tileBg: string; badge?: string;
  featured?: boolean; popularity: number; variants: V[]; ingredients: string; howToUse: string; gallery?: string[];
};

const STORAGE = "Best within 12 months of packing. Keep the pack sealed, away from heat and direct sunlight.";

const products: P[] = [
  { slug: "kashmiri-chilli", name: "Kashmiri Chilli", cat: "basic-spices", image: img("kashmiri-chilli.webp"), tileBg: "#FFF0D4", badge: "Deep colour", featured: true, popularity: 100,
    summary: "Deep red colour, gentle heat. Ground from whole Kashmiri chillies with the stalks removed by hand — the colour in your gravy comes from the chilli, not from dye.",
    variants: [["100 g", 60, 80], ["200 g", 110, 140], ["500 g", 255, 320], ["1 kg", 480, 600]],
    ingredients: "100% ground Kashmiri chilli (Capsicum annuum). Nothing else — no starch, no colour, no anti-caking agent.",
    howToUse: "Add to hot oil early so the colour bleeds into the masala. Use it wherever you want red without heat.", gallery: [TEXTURE, POWDERS] },
  { slug: "cumin-coriander", name: "Cumin Coriander", cat: "basic-spices", image: img("cumin-coriander.png"), tileBg: "#FFE7C2", badge: "Bestseller", featured: true, popularity: 96,
    summary: "The everyday dhana-jeeru blend Gujarati kitchens run on. Roasted cumin and coriander, ground together in the right ratio.",
    variants: [["100 g", 45, 60], ["200 g", 70, 90], ["500 g", 165, 210]],
    ingredients: "Coriander seed, cumin seed. Nothing else.",
    howToUse: "Stir in with the tomatoes for sabzi and dal, or sprinkle over raita and buttermilk.", gallery: [TEXTURE] },
  { slug: "amchur-masala", name: "Amchur Masala", cat: "basic-spices", image: img("amchur-masala.png"), tileBg: "#DCEDDF", badge: "Tangy", featured: true, popularity: 88,
    summary: "Sun-dried raw mango, ground fine. Sourness without the water that tamarind or tomato brings.",
    variants: [["100 g", 90, 120]],
    ingredients: "Dried raw mango powder.",
    howToUse: "Add at the end of cooking to bhindi, chana, aloo and chaat. A pinch goes a long way." },
  { slug: "roasted-cumin-powder", name: "Roasted Cumin Powder", cat: "basic-spices", image: img("roasted-cumin-powder.png"), tileBg: "#FFE7C2", popularity: 70,
    summary: "Cumin roasted until it smells nutty, then ground the same day. The finishing spice for raita, chaas and chaat.",
    variants: [["100 g", 70, 90]],
    ingredients: "Roasted cumin seed.",
    howToUse: "Sprinkle over curd, buttermilk, fruit chaat and dal just before serving." },
  { slug: "black-pepper-powder", name: "Black Pepper Powder", cat: "basic-spices", image: img("black-pepper-powder.png"), tileBg: "#F0E6D6", popularity: 62,
    summary: "Whole black pepper ground medium-fine. Sharp, warm and aromatic — none of the dusty flatness of old pepper.",
    variants: [["50 g", 95, 120]],
    ingredients: "Black pepper (Piper nigrum).",
    howToUse: "Finish soups, eggs, rasam and tikka marinades. Add late to keep its bite." },
  { slug: "tea-masala", name: "Tea Masala", cat: "basic-spices", image: img("tea-masala.png"), tileBg: "#FFF0D4", popularity: 74,
    summary: "Ginger, cardamom, cinnamon, clove and pepper, balanced for a milky Indian chai.",
    variants: [["50 g", 70, 80]],
    ingredients: "Dry ginger, cardamom, black pepper, cinnamon, clove, nutmeg.",
    howToUse: "A quarter teaspoon per cup, added with the tea leaves while the water boils." },
  { slug: "turmeric-powder", name: "Turmeric Powder", cat: "basic-spices", tileBg: "#FFF0D4", popularity: 80,
    summary: "Bright, earthy haldi ground from whole turmeric fingers. The yellow is the turmeric's own.",
    variants: [["100 g", 45, 60], ["200 g", 85, 110], ["500 g", 200, 260]],
    ingredients: "Turmeric (Curcuma longa).",
    howToUse: "Add to hot oil or with onions. Half a teaspoon is enough for a family-sized sabzi." },
  { slug: "coriander-powder", name: "Coriander Powder", cat: "basic-spices", tileBg: "#FFE7C2", popularity: 72,
    summary: "Coriander seed, cleaned and ground fine. Citrusy, mild and the backbone of most gravies.",
    variants: [["100 g", 40, 55], ["200 g", 75, 100], ["500 g", 180, 230]],
    ingredients: "Coriander seed (Coriandrum sativum).",
    howToUse: "Add with the tomatoes and cook until the oil separates." },
  { slug: "chilli-powder", name: "Chilli Powder", cat: "basic-spices", tileBg: "#FFDCD2", popularity: 78,
    summary: "Everyday red chilli powder with honest heat. For the dishes where you want it hot.",
    variants: [["100 g", 50, 65], ["200 g", 95, 120], ["500 g", 225, 280]],
    ingredients: "Red chilli.",
    howToUse: "Add to hot oil and fry briefly — don't let it scorch." },
  { slug: "pav-bhaji-masala", name: "Pav Bhaji Masala", cat: "veg-masalas", image: img("pav-bhaji-masala.png"), tileBg: "#DCEDDF", popularity: 86,
    summary: "The Vadodara stall-style blend. Butter, mashed vegetables and this — nothing clever needed.",
    variants: [["100 g", 50, 60]],
    ingredients: "Coriander, red chilli, cumin, fennel, black salt, dry mango, black pepper, cinnamon, clove, cardamom, bay leaf, star anise.",
    howToUse: "Two teaspoons per 500 g of vegetables. Fry in butter with the onion-tomato base before adding the mash." },
  { slug: "sambhar-masala", name: "Sambhar Masala", cat: "veg-masalas", image: img("sambhar-masala.png"), tileBg: "#DCEDDF", popularity: 68,
    summary: "Roasted lentils, chillies and seeds for a proper South Indian sambhar with body.",
    variants: [["100 g", 50, 60]],
    ingredients: "Coriander, red chilli, bengal gram, cumin, fenugreek, black pepper, curry leaves, asafoetida, turmeric.",
    howToUse: "Two teaspoons per cup of toor dal. Add with the tamarind water and simmer five minutes." },
  { slug: "paneer-tikka-masala", name: "Paneer Tikka Masala", cat: "veg-masalas", image: img("paneer-tikka-masala.png"), tileBg: "#FFDCD2", popularity: 76,
    summary: "Smoky, tangy tikka blend for the gravy or the marinade. Restaurant flavour without the cream overload.",
    variants: [["100 g", 55, 65]],
    ingredients: "Coriander, red chilli, kasuri methi, cumin, dry ginger, dry mango, black salt, garam masala spices.",
    howToUse: "Mix two teaspoons into curd with a little oil and salt; marinate paneer for 30 minutes." },
  { slug: "garam-masala", name: "Garam Masala", cat: "veg-masalas", tileBg: "#FFDCD2", popularity: 84,
    summary: "Our own whole-spice blend — warm, not bitter. Made in small lots so it stays aromatic.",
    variants: [["100 g", 50, 60]],
    ingredients: "Coriander, cumin, black pepper, cinnamon, clove, cardamom, bay leaf, nutmeg, mace.",
    howToUse: "Finish a dish with half a teaspoon in the last two minutes of cooking." },
  { slug: "kitchen-king-masala", name: "Kitchen King Masala", cat: "veg-masalas", tileBg: "#FFE7C2", popularity: 66,
    summary: "The all-rounder for paneer, mixed veg and dal makhani. One spoon replaces four jars.",
    variants: [["100 g", 55, 65]],
    ingredients: "Coriander, red chilli, cumin, turmeric, fenugreek, dry ginger, black pepper, garam masala spices.",
    howToUse: "One to two teaspoons per dish, added once the onion-tomato masala has cooked through." },
  { slug: "chat-masala", name: "Chat Masala", cat: "veg-masalas", tileBg: "#DCEDDF", popularity: 64,
    summary: "Tangy, salty, a little funky. Sprinkle on fruit, chaat, fries and salads.",
    variants: [["100 g", 50, 60]],
    ingredients: "Dry mango, black salt, cumin, coriander, black pepper, mint, asafoetida.",
    howToUse: "Sprinkle over the finished dish, to taste." },
  { slug: "meat-masala", name: "Meat Masala", cat: "non-veg-masalas", image: img("meat-masala.png"), tileBg: "#FFDCD2", badge: "In-house blend", featured: true, popularity: 90,
    summary: "A deep, warming blend built for slow-cooked mutton. Onions cooked properly, this, and patience.",
    variants: [["100 g", 50, 60]],
    ingredients: "Coriander, red chilli, cumin, black pepper, cinnamon, clove, cardamom, bay leaf, nutmeg, mace, star anise.",
    howToUse: "Three teaspoons per 500 g of meat. Fry with the onions until dark before adding the meat." },
  { slug: "chicken-masala", name: "Chicken Masala", cat: "non-veg-masalas", tileBg: "#FFDCD2", popularity: 82,
    summary: "Brighter and lighter than our meat masala, for home-style chicken curry.",
    variants: [["100 g", 50, 60]],
    ingredients: "Coriander, red chilli, cumin, turmeric, fennel, black pepper, dry ginger, garam masala spices.",
    howToUse: "Two to three teaspoons per 500 g of chicken, added with the tomatoes." },
  { slug: "curry-spice-kit", name: "Curry Spice Kit", cat: "combo-kits", image: img("curry-spice-kit.webp"), tileBg: "#FFF0D4", badge: "Save 20%", popularity: 60,
    summary: "Paneer tikka, garam masala, sambhar and kitchen king masala in one gift-ready kit.",
    variants: [["6-spice kit", 230, 290]],
    ingredients: "Paneer Tikka Masala, Garam Masala, Sambhar Masala, Kitchen King Masala and two basic spices — each in its own sealed pack.",
    howToUse: "Each pack carries its own directions on the back." },
  { slug: "non-veg-spice-kit", name: "Non-Veg Spice Kit", cat: "combo-kits", image: img("non-veg-spice-kit.webp"), tileBg: "#FFDCD2", badge: "Save 20%", popularity: 55,
    summary: "Everything for a meat or chicken curry night: meat masala, chicken masala and the basics.",
    variants: [["5-spice kit", 260, 325]],
    ingredients: "Meat Masala, Chicken Masala, Kashmiri Chilli, Turmeric and Garam Masala — each in its own sealed pack.",
    howToUse: "Each pack carries its own directions on the back." },
  { slug: "kitchen-e-bahar", name: "Kitchen E Bahar", cat: "combo-kits", image: img("kitchen-e-bahar.webp"), tileBg: "#DCEDDF", badge: "14 spices", popularity: 92,
    summary: "Fourteen spices and masalas in a single crate. For a new home, a hostel kitchen, or a wedding gift that actually gets used.",
    variants: [["14-spice kit", 950, 1185]],
    ingredients: "Amchur, Garam Masala, Chat Masala, Kitchen King, Kashmiri Mirch, Paneer Tikka, Pav Bhaji, Tea, Sambhar and Meat Masala, Chilli, Coriander and Turmeric Powder, Roasted Cumin, Black Pepper and Chicken Masala.",
    howToUse: "Each pack carries its own directions on the back." },
  { slug: "paneer-tikka-ready-mix", name: "Paneer Tikka Ready Mix", cat: "ready-mixes", image: img("paneer-tikka-ready-mix.webp"), tileBg: "#FFF0D4", popularity: 58,
    summary: "Marinade mix for paneer tikka — just add curd and a spoon of oil.",
    variants: [["50 g", 60, 75]],
    ingredients: "Red chilli, coriander, gram flour, salt, kasuri methi, cumin, black pepper, dry ginger, dry mango, garam masala spices.",
    howToUse: "Mix the pack with 150 g curd and a spoon of oil. Coat 250 g paneer and rest 30 minutes before grilling." },
];

const recipes = [
  { slug: "pav-bhaji-vadodara-stall-style", title: "Pav bhaji, Vadodara stall style", tag: "Street food", time: "35 min", image: stock("photo-1753357303396-704b5abe8945"),
    summary: "Butter, mash and our pav bhaji masala. Nothing clever.", products: "pav-bhaji-masala,kashmiri-chilli",
    ingredients: "3 potatoes, boiled\n1 cup cauliflower, boiled\n1/2 cup green peas\n1 capsicum, finely chopped\n2 onions, finely chopped\n3 tomatoes, finely chopped\n1 tbsp ginger-garlic paste\n2 tsp Home Queen Pav Bhaji Masala\n1 tsp Home Queen Kashmiri Chilli\n4 tbsp butter\n8 pav, lemon and coriander to serve",
    steps: "Melt 2 tbsp butter on a tawa or wide pan. Fry the onions until soft and golden.\nAdd ginger-garlic paste and capsicum; cook two minutes.\nAdd tomatoes, Kashmiri chilli and pav bhaji masala. Cook until the tomatoes break down completely.\nAdd the boiled vegetables and mash everything together hard, adding splashes of water until it's thick and smooth.\nSimmer five minutes, finish with a knob of butter, coriander and lemon.\nToast the pav in butter with a pinch of masala and serve hot." },
  { slug: "everyday-aloo-sabzi-cumin-coriander", title: "Everyday aloo sabzi with cumin coriander", tag: "Everyday sabzi", time: "20 min", image: stock("photo-1789990642036-e10c2df4fc81"),
    summary: "The one-pan sabzi that gets made four nights a week.", products: "cumin-coriander,turmeric-powder,chilli-powder",
    ingredients: "4 potatoes, cubed\n2 tbsp oil\n1 tsp cumin seeds\n1 tomato, chopped\n1/2 tsp Home Queen Turmeric Powder\n1 tsp Home Queen Chilli Powder\n2 tsp Home Queen Cumin Coriander\nSalt, coriander leaves",
    steps: "Heat oil, add cumin seeds and let them crackle.\nAdd potatoes, turmeric and salt. Cover and cook on low for 8 minutes.\nAdd tomato, chilli powder and cumin coriander. Cook uncovered until the potatoes are tender and coated.\nFinish with coriander leaves. Serve with rotli or puri." },
  { slug: "paneer-tikka-without-a-tandoor", title: "Paneer tikka without a tandoor", tag: "Starter", time: "40 min", image: stock("photo-1757715376287-90f24dac4593"),
    summary: "A hot pan and a high flame do most of the work.", products: "paneer-tikka-masala,paneer-tikka-ready-mix",
    ingredients: "250 g paneer, cubed\n1 capsicum and 1 onion, in squares\n150 g thick curd\n2 tsp Home Queen Paneer Tikka Masala\n1 tbsp mustard oil\n1 tsp ginger-garlic paste\nSalt, lemon, chaat masala",
    steps: "Whisk curd, masala, oil, ginger-garlic paste and salt.\nCoat the paneer and vegetables and rest 30 minutes.\nThread onto skewers or lay flat in a smoking-hot cast-iron pan.\nSear each side until charred at the edges, about 2 minutes a side.\nFinish with lemon and a pinch of chaat masala." },
  { slug: "home-style-meat-curry", title: "Home-style meat curry, no shortcuts", tag: "Non-veg", time: "55 min", image: stock("photo-1545247181-516773cae754"),
    summary: "Meat masala, onions cooked properly, and patience.", products: "meat-masala,kashmiri-chilli",
    ingredients: "500 g mutton, curry cut\n3 onions, sliced\n2 tomatoes, pureed\n1 tbsp ginger-garlic paste\n3 tsp Home Queen Meat Masala\n1 tsp Home Queen Kashmiri Chilli\n3 tbsp oil, whole spices, salt",
    steps: "Heat oil with whole spices. Fry the onions slowly until deep brown — 15 minutes, don't rush it.\nAdd ginger-garlic paste, then meat masala and Kashmiri chilli with a splash of water.\nAdd the mutton and sear until it changes colour.\nAdd tomato puree and salt, cook until the oil separates.\nAdd hot water, cover and cook until tender (pressure cook 4–5 whistles, or simmer 45 minutes)." },
  { slug: "why-roasting-cumin-changes-everything", title: "Why roasting cumin changes everything", tag: "Spice know-how", time: "4 min read", image: stock("photo-1773869910193-c7ae23145ac9"),
    summary: "What heat does to cumin, and when to stop.", products: "roasted-cumin-powder,cumin-coriander",
    ingredients: "Whole cumin seeds\nA heavy dry pan",
    steps: "Raw cumin is grassy and slightly bitter. Heat drives off moisture and turns its oils toasty and nutty.\nRoast on a medium flame, shaking the pan, until the seeds go one shade darker and smell like popcorn — about 90 seconds.\nStop before any seed turns black; burnt cumin tastes acrid and nothing fixes it.\nCool completely before grinding, or the powder will clump.\nOur Roasted Cumin Powder is roasted and ground the same day for exactly this reason." },
  { slug: "masala-chai-measured-properly", title: "Masala chai, measured properly", tag: "Spice know-how", time: "10 min", image: stock("photo-1561336526-2914f13ceb36"),
    summary: "How much tea masala per cup, and when to add it.", products: "tea-masala",
    ingredients: "1 cup water\n1 cup milk\n2 tsp black tea\n1/4 tsp Home Queen Tea Masala per cup\nSugar to taste",
    steps: "Bring the water to a boil and add the tea masala first — spices need the water, not the milk, to open up.\nAdd tea leaves and sugar; boil for one minute.\nAdd milk and bring it up to a rolling boil twice.\nStrain and serve straight away." },
  { slug: "kitchen-king-paneer-mattar", title: "Paneer mattar with kitchen king", tag: "Everyday sabzi", time: "30 min", image: stock("photo-1781332146569-9c5093bc2ca5"),
    summary: "One spoon of kitchen king does the job of four jars.", products: "kitchen-king-masala,garam-masala",
    ingredients: "200 g paneer\n1 cup green peas\n2 onions and 2 tomatoes, pureed\n2 tsp Home Queen Kitchen King Masala\n1/2 tsp Home Queen Garam Masala\nOil, salt, cream (optional)",
    steps: "Cook the onion puree in oil until golden.\nAdd the tomato puree and kitchen king masala; cook until the oil separates.\nAdd peas and a cup of water; simmer five minutes.\nAdd paneer, garam masala and a spoon of cream. Simmer two minutes and serve." },
  { slug: "home-style-chicken-curry", title: "Home-style chicken curry", tag: "Non-veg", time: "45 min", image: stock("photo-1596797038530-2c107229654b"),
    summary: "The Sunday curry — bright, not heavy.", products: "chicken-masala,turmeric-powder",
    ingredients: "500 g chicken\n2 onions, chopped\n2 tomatoes, chopped\n1 tbsp ginger-garlic paste\n3 tsp Home Queen Chicken Masala\n1/2 tsp Home Queen Turmeric Powder\nOil, salt, coriander",
    steps: "Fry onions in oil until golden, add ginger-garlic paste.\nAdd tomatoes, turmeric and chicken masala; cook down to a thick masala.\nAdd chicken and sear five minutes.\nAdd a cup of hot water, cover and simmer 20 minutes until cooked through.\nFinish with coriander." },
];

async function main() {
  console.log("Clearing tables…");
  await db.orderEvent.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.wishlistItem.deleteMany();
  await db.variant.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.address.deleteMany();
  await db.user.deleteMany();
  await db.coupon.deleteMany();
  await db.recipe.deleteMany();
  await db.enquiry.deleteMany();
  await db.message.deleteMany();
  await db.setting.deleteMany();

  console.log("Categories…");
  const catIds: Record<string, string> = {};
  for (const c of categories) {
    const row = await db.category.create({ data: c });
    catIds[c.slug] = row.id;
  }

  console.log("Products…");
  const variantBySku: Record<string, { id: string; price: number; label: string; productId: string; name: string; image: string | null }> = {};
  for (const p of products) {
    const row = await db.product.create({
      data: {
        slug: p.slug, name: p.name, categoryId: catIds[p.cat], summary: p.summary, image: p.image ?? null, tileBg: p.tileBg,
        badge: p.badge ?? null, featured: !!p.featured, popularity: p.popularity, ingredients: p.ingredients, howToUse: p.howToUse,
        storage: STORAGE, gallery: JSON.stringify(p.gallery ?? []),
        variants: {
          create: p.variants.map(([label, price, compareAt, stock], i) => ({
            label, price, compareAt, stock: stock ?? 120, sortOrder: i,
            sku: `HQ-${p.slug.toUpperCase().replace(/-/g, "").slice(0, 10)}-${label.replace(/\s+/g, "").toUpperCase()}`,
          })),
        },
      },
      include: { variants: true },
    });
    for (const v of row.variants) variantBySku[v.sku] = { id: v.id, price: v.price, label: v.label, productId: row.id, name: row.name, image: row.image };
  }
  // A couple of low-stock items so the admin alert has something to show.
  await db.variant.updateMany({ where: { sku: { contains: "BLACKPEPPE" } }, data: { stock: 6 } });
  await db.variant.updateMany({ where: { sku: { contains: "KITCHENEBA" } }, data: { stock: 4 } });

  console.log("Recipes…");
  for (const [i, r] of recipes.entries()) await db.recipe.create({ data: { ...r, sortOrder: i } });

  console.log("Coupons & settings…");
  await db.coupon.createMany({
    data: [
      { code: "WELCOME10", description: "10% off your first order", type: "PERCENT", value: 10, minOrder: 199, maxDiscount: 100 },
      { code: "SWAD50", description: "₹50 off orders above ₹499", type: "FLAT", value: 50, minOrder: 499 },
      { code: "KITCHEN20", description: "20% off above ₹999", type: "PERCENT", value: 20, minOrder: 999, maxDiscount: 300 },
    ],
  });
  await db.setting.createMany({
    data: [
      { key: "freeShippingThreshold", value: "249" },
      { key: "shippingFee", value: "40" },
      { key: "codFee", value: "0" },
    ],
  });

  console.log("Users…");
  const admin = await db.user.create({
    data: { name: "Store Admin", email: "admin@homequeenspices.com", phone: "8866911100", role: "ADMIN", passwordHash: await bcrypt.hash("Admin@123", 10) },
  });
  const customer = await db.user.create({
    data: {
      name: "Priya Shah", email: "customer@example.com", phone: "9876543210", passwordHash: await bcrypt.hash("Customer@123", 10),
      addresses: { create: { name: "Priya Shah", phone: "9876543210", line1: "12, Sunrise Society", line2: "Near Alkapuri Circle", city: "Vadodara", state: "Gujarat", pincode: "390007", isDefault: true } },
    },
  });

  console.log("Sample orders…");
  const sku = (s: string) => {
    const k = Object.keys(variantBySku).find((x) => x.startsWith(s));
    if (!k) throw new Error("sku " + s);
    return variantBySku[k];
  };
  const sample: { days: number; status: string; pay: string; paid: boolean; items: [string, number][] }[] = [
    { days: 26, status: "DELIVERED", pay: "COD", paid: true, items: [["HQ-KASHMIRICH-100G", 2], ["HQ-GARAMMASAL-100G", 1]] },
    { days: 19, status: "DELIVERED", pay: "ONLINE", paid: true, items: [["HQ-KITCHENEBA-14", 1]] },
    { days: 9, status: "SHIPPED", pay: "ONLINE", paid: true, items: [["HQ-CURRYSPICE-6", 1], ["HQ-TEAMASALA-50G", 2]] },
    { days: 2, status: "CONFIRMED", pay: "COD", paid: false, items: [["HQ-CUMINCORIA-200G", 2], ["HQ-MEATMASALA-100G", 1]] },
    { days: 0, status: "PLACED", pay: "COD", paid: false, items: [["HQ-PAVBHAJIMA-100G", 3]] },
  ];
  const flow = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"];
  let n = 100231;
  for (const o of sample) {
    const created = new Date(Date.now() - o.days * 86400000 - 3 * 3600000);
    const lines = o.items.map(([s, qty]) => ({ v: sku(s), qty }));
    const subtotal = lines.reduce((a, l) => a + l.v.price * l.qty, 0);
    const shipping = subtotal >= 249 ? 0 : 40;
    const upTo = flow.indexOf(o.status);
    await db.order.create({
      data: {
        number: `HQ${n++}`, userId: customer.id, status: o.status, paymentMethod: o.pay, paymentStatus: o.paid ? "PAID" : "PENDING",
        subtotal, shipping, total: subtotal + shipping, createdAt: created,
        shipName: "Priya Shah", shipPhone: "9876543210", shipLine1: "12, Sunrise Society", shipLine2: "Near Alkapuri Circle",
        shipCity: "Vadodara", shipState: "Gujarat", shipPincode: "390007",
        courier: upTo >= 3 ? "Delhivery" : null, trackingNumber: upTo >= 3 ? `DLV${n}8841` : null,
        items: { create: lines.map((l) => ({ productId: l.v.productId, variantId: l.v.id, name: l.v.name, variantLabel: l.v.label, image: l.v.image, price: l.v.price, qty: l.qty })) },
        events: { create: flow.slice(0, upTo + 1).map((s, i) => ({ status: s, createdAt: new Date(created.getTime() + i * 20 * 3600000) })) },
      },
    });
  }

  // Extra orders from other customers so the admin dashboard has a realistic spread.
  const names = ["Rohan Mehta", "Aisha Khan", "Vikram Patel", "Neha Joshi", "Arjun Desai", "Kavya Nair", "Harpreet Singh", "Meera Iyer"];
  const skus = Object.keys(variantBySku);
  for (const [i, name] of names.entries()) {
    const u = await db.user.create({
      data: {
        name, email: name.toLowerCase().replace(/\s+/g, ".") + "@example.com", phone: `98${String(10000000 + i * 1234567).slice(0, 8)}`,
        passwordHash: await bcrypt.hash("Customer@123", 10), createdAt: new Date(Date.now() - (30 - i * 3) * 86400000),
      },
    });
    const count = 1 + (i % 3);
    for (let k = 0; k < count; k++) {
      const days = (i * 5 + k * 7) % 28;
      const created = new Date(Date.now() - days * 86400000 - (i + 1) * 3600000);
      const lines = [0, 1, 2].slice(0, 1 + ((i + k) % 3)).map((j) => ({ v: variantBySku[skus[(i * 7 + k * 3 + j * 5) % skus.length]], qty: 1 + ((i + j) % 2) }));
      const subtotal = lines.reduce((a, l) => a + l.v.price * l.qty, 0);
      const shipping = subtotal >= 249 ? 0 : 40;
      const status = days > 10 ? "DELIVERED" : days > 5 ? "SHIPPED" : days > 1 ? "PACKED" : "PLACED";
      const pay = (i + k) % 2 ? "ONLINE" : "COD";
      const upTo = flow.indexOf(status);
      await db.order.create({
        data: {
          number: `HQ${n++}`, userId: u.id, status, paymentMethod: pay,
          paymentStatus: pay === "ONLINE" || status === "DELIVERED" ? "PAID" : "PENDING",
          subtotal, shipping, total: subtotal + shipping, createdAt: created,
          shipName: name, shipPhone: u.phone!, shipLine1: `${10 + i} MG Road`, shipCity: ["Ahmedabad", "Surat", "Mumbai", "Pune", "Vadodara", "Rajkot", "Delhi", "Bengaluru"][i],
          shipState: ["Gujarat", "Gujarat", "Maharashtra", "Maharashtra", "Gujarat", "Gujarat", "Delhi", "Karnataka"][i], shipPincode: "3900" + (10 + i),
          items: { create: lines.map((l) => ({ productId: l.v.productId, variantId: l.v.id, name: l.v.name, variantLabel: l.v.label, image: l.v.image, price: l.v.price, qty: l.qty })) },
          events: { create: flow.slice(0, upTo + 1).map((s, j) => ({ status: s, createdAt: new Date(created.getTime() + j * 20 * 3600000) })) },
        },
      });
    }
  }

  console.log("Enquiries & messages…");
  await db.enquiry.create({ data: { name: "Suresh Agarwal", firm: "Agarwal Traders", city: "Surat", phone: "9825012345", type: "Distributor", volume: "About 400 kg a month across 60 kirana stores." } });
  await db.message.create({ data: { name: "Anil Kumar", email: "anil@example.com", phone: "9909012345", message: "Do you ship to Hyderabad? And is the Kitchen E Bahar kit available in a smaller size?" } });

  console.log(`Done. Admin: ${admin.email} / Admin@123 · Customer: ${customer.email} / Customer@123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
