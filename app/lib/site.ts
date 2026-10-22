export const SITE = {
  name: "Sela",
  url: "https://sela-ring.vercel.app",
  description:
    "Sela is a fictional smart ring that reads your heart, sleep and temperature and turns them into one calm morning score. A design concept by Nova Digital Studio.",
};

export function pageMeta(title: string, description = SITE.description, path = "/") {
  const url = `${SITE.url}${path}`;
  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Sela (concept)" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: `${SITE.url}/og.png` },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: `${SITE.url}/og.png` },
  ];
}

export const NAV = [
  { label: "How it works", hash: "heart" },
  { label: "Ring", to: "/ring" },
  { label: "App", hash: "app" },
  { label: "Science", hash: "privacy" },
];

/** Concept pricing, used by the home picker and the ring page. */
export const FINISHES = [
  { id: "bone", name: "Bone ceramic", price: 349, swatch: "radial-gradient(circle at 35% 30%, #FFFDF8, #E6DDCF 55%, #C9BDAA)" },
  { id: "titanium", name: "Brushed titanium", price: 399, swatch: "linear-gradient(135deg, #E9E7E3, #A9A59F 45%, #D6D3CE 60%, #8D8984)" },
  { id: "black", name: "Black", price: 379, swatch: "radial-gradient(circle at 35% 30%, #5A5860, #1F1E22 60%, #0E0D10)" },
] as const;
export const SIZES = [6, 7, 8, 9, 10, 11, 12, 13];
export const MEMBERSHIP = 5.99;
