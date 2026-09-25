// Stock photography (Unsplash licence — free for commercial use, no attribution required).
// Swap any of these for your own shoots from the mill when you have them.
const u = (id: string, w = 1400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const STOCK = {
  handsGrinding: u("photo-1768729340804-dd94f6dd612e", 1200),
  spicesWide: u("photo-1596040033229-a9821ebd058d", 2000),
  chilliSacks: u("photo-1786297766847-610b42876800", 900),
  chilliSorting: u("photo-1771769606888-86e2f4c6c65e", 900),
  groundPowders: u("photo-1506368249639-73a05d6f6488", 900),
  spiceJars: u("photo-1591272216626-b09e38519371", 900),
  spiceFlatlay: u("photo-1581600140682-d4e68c8cde32", 1000),
  spiceBowls: u("photo-1532336414038-cf19250c5757", 1000),
  pavBhaji: u("photo-1753357303396-704b5abe8945", 1000),
  alooSabzi: u("photo-1789990642036-e10c2df4fc81", 1000),
  paneerTikka: u("photo-1757715376287-90f24dac4593", 1000),
  meatCurry: u("photo-1545247181-516773cae754", 1000),
  cuminScoops: u("photo-1773869910193-c7ae23145ac9", 1000),
  chai: u("photo-1561336526-2914f13ceb36", 1000),
  paneerPlate: u("photo-1781332146569-9c5093bc2ca5", 1000),
  chickenCurry: u("photo-1596797038530-2c107229654b", 1000),
};
