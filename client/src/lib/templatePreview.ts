import type { TemplateMetadata } from "@/data/templates";

const palettes = [
  { ink: "#17211f", muted: "#66716d", accent: "#326b5c", wash: "#e5f0e9", paper: "#f7f8f4" },
  { ink: "#1d2230", muted: "#6d7180", accent: "#5365a7", wash: "#e9ecf7", paper: "#f7f7fa" },
  { ink: "#25211e", muted: "#756d65", accent: "#a15c3b", wash: "#f4e9e1", paper: "#faf8f5" },
  { ink: "#1d252a", muted: "#65747b", accent: "#287286", wash: "#e4f0f2", paper: "#f5f8f8" },
  { ink: "#29251f", muted: "#797065", accent: "#9b7941", wash: "#f2edde", paper: "#faf9f5" },
];

function hash(value: string) {
  let result = 0;
  for (const character of value) result = (result * 31 + character.charCodeAt(0)) >>> 0;
  return result;
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[character]!);
}

function renderFamilyPreview(category: string, seed: number, palette: (typeof palettes)[number]) {
  const variant = seed % 3;
  const label = (value: string, x: number, y: number) =>
    `<text x="${x}" y="${y}" fill="${palette.muted}" font-family="Arial,sans-serif" font-size="9">${value}</text>`;
  const card = (x: number, y: number, width: number, height: number, fill = palette.paper) =>
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="9" fill="${fill}" stroke="#edf0eb"/>`;

  if (category === "saas") {
    if (variant === 0) {
      return `<g data-preview-family="saas">${card(378, 100, 286, 318, "#fff")}${label("WORKSPACE OVERVIEW", 396, 124)}${[0, 1, 2].map((item) => `${card(396 + item * 82, 140, 72, 54)}${label(["Active", "Growth", "Tasks"][item], 405 + item * 82, 157)}<text x="${405 + item * 82}" y="181" fill="${palette.ink}" font-family="Arial,sans-serif" font-size="15" font-weight="700">${["24", "+18%", "08"][item]}</text>`).join("")}${card(396, 210, 250, 188)}${label("Usage over time", 410, 231)}${Array.from({ length: 7 }, (_, index) => `<rect x="${412 + index * 30}" y="${350 - ((seed >>> index) % 70)}" width="17" height="${48 + ((seed >>> index) % 70)}" rx="4" fill="${palette.accent}" opacity="${0.45 + index * 0.06}"/>`).join("")}</g>`;
    }
    if (variant === 1) {
      return `<g data-preview-family="saas">${card(378, 100, 286, 318, "#fff")}<rect x="378" y="100" width="60" height="318" rx="9" fill="${palette.ink}"/>${[0, 1, 2, 3].map((item) => `<rect x="390" y="${127 + item * 34}" width="${item === 0 ? 34 : 24}" height="7" rx="3.5" fill="${item === 0 ? palette.wash : "#718078"}"/>`).join("")}${label("REVIEW QUEUE", 454, 126)}${[0, 1, 2].map((item) => `${card(454, 145 + item * 77, 192, 65)}<circle cx="472" cy="${166 + item * 77}" r="8" fill="${palette.wash}"/><rect x="488" y="${158 + item * 77}" width="${86 - item * 9}" height="8" rx="4" fill="${palette.ink}" opacity=".72"/><rect x="488" y="${173 + item * 77}" width="126" height="5" rx="2.5" fill="${palette.muted}" opacity=".2"/>`).join("")}</g>`;
    }
    return `<g data-preview-family="saas">${card(378, 100, 286, 318, "#fff")}${label("PIPELINE", 396, 124)}${["NEW", "IN REVIEW", "DONE"].map((stage, column) => `${label(stage, 396 + column * 83, 151)}${[0, 1].map((row) => `${card(396 + column * 83, 163 + row * 104, 74, 91)}<rect x="${405 + column * 83}" y="${178 + row * 104}" width="54" height="6" rx="3" fill="${palette.accent}" opacity=".6"/><rect x="${405 + column * 83}" y="${192 + row * 104}" width="45" height="6" rx="3" fill="${palette.ink}" opacity=".16"/><circle cx="${414 + column * 83}" cy="${229 + row * 104}" r="8" fill="${palette.wash}"/>`).join("")}`).join("")}</g>`;
  }

  if (category === "ecommerce") {
    if (variant === 0) {
      return `<g data-preview-family="ecommerce">${card(378, 100, 286, 318, "#fff")}${label("NEW COLLECTION", 396, 124)}${card(396, 139, 250, 99, palette.wash)}<circle cx="521" cy="188" r="36" fill="#ffffffb8"/><circle cx="521" cy="188" r="24" fill="${palette.accent}" opacity=".22"/>${[0, 1, 2].map((item) => `${card(396 + item * 84, 252, 76, 125)}<rect x="${402 + item * 84}" y="260" width="64" height="66" rx="6" fill="${["#eee8df", "#e7ece8", "#f0e5e0"][item]}"/><rect x="${402 + item * 84}" y="335" width="54" height="6" rx="3" fill="${palette.ink}" opacity=".5"/><rect x="${402 + item * 84}" y="350" width="28" height="6" rx="3" fill="${palette.accent}" opacity=".6"/>`).join("")}</g>`;
    }
    if (variant === 1) {
      return `<g data-preview-family="ecommerce">${card(378, 100, 286, 318, "#fff")}${card(394, 116, 140, 188, palette.wash)}<circle cx="464" cy="210" r="48" fill="#ffffffb8"/><circle cx="464" cy="210" r="30" fill="${palette.accent}" opacity=".25"/>${label("OBJECT No. 04", 548, 136)}<rect x="548" y="154" width="96" height="9" rx="4.5" fill="${palette.ink}" opacity=".74"/><rect x="548" y="173" width="77" height="7" rx="3.5" fill="${palette.muted}" opacity=".24"/><text x="548" y="213" fill="${palette.ink}" font-family="Arial,sans-serif" font-size="17" font-weight="700">€148</text>${[0, 1, 2, 3].map((item) => `<circle cx="${553 + item * 22}" cy="238" r="7" fill="${[palette.accent, "#d0bfa5", "#c5cbc5", "#272c2a"][item]}"/>`).join("")}${card(548, 260, 96, 27, palette.accent)}${label("DETAILS  ·  DELIVERY  ·  CARE", 397, 337)}${card(396, 356, 248, 39)}</g>`;
    }
    return `<g data-preview-family="ecommerce">${card(378, 100, 286, 318, "#fff")}${label("SHOP BY CATEGORY", 396, 124)}${["STUDIO", "OBJECTS", "ESSENTIALS"].map((item, index) => `${card(396, 140 + index * 84, 250, 69, ["#eee8df", "#e7ece8", "#f0e5e0"][index])}<rect x="410" y="${156 + index * 84}" width="58" height="37" rx="5" fill="${palette.accent}" opacity=".18"/><rect x="485" y="${156 + index * 84}" width="100" height="7" rx="3.5" fill="${palette.ink}" opacity=".55"/><text x="485" y="${178 + index * 84}" fill="${palette.accent}" font-family="Arial,sans-serif" font-size="8" font-weight="700">${item}</text>`).join("")}</g>`;
  }

  if (category === "portfolio") {
    if (variant === 0) {
      return `<g data-preview-family="portfolio">${card(378, 100, 286, 318, "#fff")}${label("SELECTED WORK  /  2026", 396, 124)}${card(396, 140, 152, 165, palette.wash)}<path d="M410 278l44-66 26 29 30-45 24 31" fill="none" stroke="${palette.accent}" stroke-width="4"/><circle cx="500" cy="190" r="17" fill="${palette.accent}" opacity=".22"/>${card(558, 140, 88, 75, "#eae8f0")}${card(558, 224, 88, 81, "#e9eee9")}${label("01  /  IDENTITY", 396, 328)}<rect x="396" y="342" width="184" height="7" rx="3.5" fill="${palette.ink}" opacity=".55"/><rect x="396" y="360" width="110" height="6" rx="3" fill="${palette.muted}" opacity=".22"/></g>`;
    }
    if (variant === 1) {
      return `<g data-preview-family="portfolio">${card(378, 100, 286, 318, "#fff")}${label("CASE STUDY  /  01", 396, 124)}${card(396, 141, 250, 151, palette.ink)}<path d="M414 258l56-70 35 38 40-57 43 54" fill="none" stroke="${palette.wash}" stroke-width="5"/><rect x="396" y="310" width="148" height="10" rx="5" fill="${palette.ink}" opacity=".65"/><rect x="396" y="331" width="232" height="7" rx="3.5" fill="${palette.muted}" opacity=".22"/><rect x="396" y="347" width="207" height="7" rx="3.5" fill="${palette.muted}" opacity=".16"/><rect x="396" y="375" width="82" height="22" rx="7" fill="${palette.wash}"/></g>`;
    }
    return `<g data-preview-family="portfolio">${card(378, 100, 286, 318, "#fff")}${label("PROJECT INDEX", 396, 124)}${[0, 1, 2, 3].map((item) => `${card(396, 141 + item * 62, 250, 50)}<circle cx="418" cy="${166 + item * 62}" r="12" fill="${["#e9ecf7", "#f4e9e1", "#e5f0e9", "#e4f0f2"][item]}"/><rect x="441" y="${158 + item * 62}" width="${110 + (seed >>> item) % 60}" height="7" rx="3.5" fill="${palette.ink}" opacity=".58"/><rect x="441" y="${173 + item * 62}" width="126" height="5" rx="2.5" fill="${palette.muted}" opacity=".2"/><text x="617" y="${171 + item * 62}" fill="${palette.accent}" font-family="Arial,sans-serif" font-size="8">↗</text>`).join("")}</g>`;
  }

  if (category === "business") {
    if (variant === 0) {
      return `<g data-preview-family="business">${card(378, 100, 286, 318, "#fff")}${label("YOUR APPOINTMENT", 396, 124)}${card(396, 141, 250, 56, palette.wash)}<circle cx="423" cy="169" r="14" fill="${palette.accent}" opacity=".2"/><rect x="449" y="160" width="123" height="7" rx="3.5" fill="${palette.ink}" opacity=".58"/><rect x="449" y="175" width="84" height="5" rx="2.5" fill="${palette.muted}" opacity=".2"/>${label("AVAILABLE TIMES", 396, 221)}${["09:30", "11:00", "14:30", "16:00"].map((time, index) => `${card(396 + (index % 2) * 128, 234 + Math.floor(index / 2) * 51, 116, 38, index === variant ? palette.accent : "#fff")}<text x="${421 + (index % 2) * 128}" y="${258 + Math.floor(index / 2) * 51}" fill="${index === variant ? "#fff" : palette.ink}" font-family="Arial,sans-serif" font-size="10">${time}</text>`).join("")}${card(396, 345, 250, 48, palette.ink)}<text x="412" y="374" fill="#fff" font-family="Arial,sans-serif" font-size="9">LOCATION  ·  DETAILS  ·  CONTACT</text></g>`;
    }
    if (variant === 1) {
      return `<g data-preview-family="business">${card(378, 100, 286, 318, "#fff")}${label("OUR SERVICES", 396, 124)}${["Consultation", "Planning", "Follow-up"].map((item, index) => `${card(396, 141 + index * 78, 250, 63)}<circle cx="418" cy="${172 + index * 78}" r="13" fill="${palette.wash}"/><rect x="442" y="${159 + index * 78}" width="116" height="7" rx="3.5" fill="${palette.ink}" opacity=".62"/><rect x="442" y="${175 + index * 78}" width="165" height="5" rx="2.5" fill="${palette.muted}" opacity=".2"/><text x="612" y="${180 + index * 78}" fill="${palette.accent}" font-family="Arial,sans-serif" font-size="10">↗</text>`).join("")}</g>`;
    }
    return `<g data-preview-family="business">${card(378, 100, 286, 318, "#fff")}${label("PLAN YOUR VISIT", 396, 124)}${card(396, 141, 250, 112, palette.wash)}${[0, 1, 2].map((index) => `<rect x="${416 + index * 65}" y="163" width="54" height="66" rx="6" fill="#ffffffc7"/><rect x="${425 + index * 65}" y="175" width="36" height="6" rx="3" fill="${palette.accent}" opacity=".56"/><rect x="${425 + index * 65}" y="190" width="26" height="5" rx="2.5" fill="${palette.ink}" opacity=".18"/><rect x="${425 + index * 65}" y="204" width="31" height="5" rx="2.5" fill="${palette.ink}" opacity=".12"/>`).join("")}${label("FEATURED OFFERING", 396, 278)}<rect x="396" y="294" width="130" height="9" rx="4.5" fill="${palette.ink}" opacity=".62"/><rect x="396" y="313" width="223" height="6" rx="3" fill="${palette.muted}" opacity=".2"/>${card(396, 344, 250, 48, palette.accent)}<text x="412" y="373" fill="#fff" font-family="Arial,sans-serif" font-size="9">VIEW DETAILS  ·  GET IN TOUCH</text></g>`;
  }

  if (variant === 0) {
    return `<g data-preview-family="blog">${card(378, 100, 286, 318, "#fff")}${label("THE LATEST ISSUE", 396, 124)}${card(396, 141, 128, 168, palette.ink)}<circle cx="460" cy="215" r="36" fill="${palette.accent}" opacity=".48"/><path d="M413 284l39-52 28 30 27-35 17 34" fill="none" stroke="${palette.wash}" stroke-width="4"/><rect x="536" y="148" width="108" height="7" rx="3.5" fill="${palette.accent}" opacity=".6"/><rect x="536" y="167" width="102" height="10" rx="5" fill="${palette.ink}" opacity=".65"/><rect x="536" y="187" width="92" height="6" rx="3" fill="${palette.muted}" opacity=".2"/>${[0, 1, 2].map((index) => `<rect x="536" y="${220 + index * 23}" width="108" height="5" rx="2.5" fill="${palette.ink}" opacity="${0.2 - index * 0.03}"/>`).join("")}${label("FEATURED STORY", 396, 335)}<rect x="396" y="351" width="248" height="7" rx="3.5" fill="${palette.ink}" opacity=".48"/></g>`;
  }
  if (variant === 1) {
    return `<g data-preview-family="blog">${card(378, 100, 286, 318, "#fff")}${label("STORIES  /  EDITION 08", 396, 124)}${card(396, 141, 250, 85, palette.wash)}<rect x="412" y="159" width="73" height="49" rx="6" fill="${palette.accent}" opacity=".26"/><rect x="499" y="159" width="126" height="7" rx="3.5" fill="${palette.ink}" opacity=".62"/><rect x="499" y="177" width="100" height="6" rx="3" fill="${palette.muted}" opacity=".22"/><rect x="499" y="193" width="118" height="6" rx="3" fill="${palette.muted}" opacity=".16"/>${[0, 1, 2].map((index) => `${card(396, 238 + index * 51, 250, 40, "#fff")}<text x="407" y="${263 + index * 51}" fill="${palette.accent}" font-family="Arial,sans-serif" font-size="8">0${index + 1}</text><rect x="432" y="${253 + index * 51}" width="106" height="6" rx="3" fill="${palette.ink}" opacity=".53"/><text x="620" y="${263 + index * 51}" fill="${palette.muted}" font-family="Arial,sans-serif" font-size="8">↗</text>`).join("")}</g>`;
  }
  return `<g data-preview-family="blog">${card(378, 100, 286, 318, "#fff")}${label("LISTEN  ·  READ  ·  DISCOVER", 396, 124)}${[0, 1, 2].map((index) => `${card(396, 141 + index * 82, 250, 68)}<circle cx="430" cy="${175 + index * 82}" r="23" fill="${palette.accent}" opacity="${0.16 + index * 0.08}"/><path d="M426 ${165 + index * 82}v20l16-10z" fill="${palette.accent}"/><rect x="465" y="${160 + index * 82}" width="150" height="7" rx="3.5" fill="${palette.ink}" opacity=".62"/><rect x="465" y="${177 + index * 82}" width="112" height="5" rx="2.5" fill="${palette.muted}" opacity=".2"/><text x="465" y="${197 + index * 82}" fill="${palette.accent}" font-family="Arial,sans-serif" font-size="8">EPISODE 0${index + 1}</text>`).join("")}</g>`;
}

export function templatePreviewDataUrl(template: Pick<TemplateMetadata, "id" | "name" | "category">) {
  const seed = hash(template.id);
  const palette = palettes[seed % palettes.length];
  const words = template.name.split(/\s+/);
  const lines: string[] = [];
  for (const word of words) {
    const last = lines.length - 1;
    if (last >= 0 && `${lines[last]} ${word}`.length <= 17) lines[last] += ` ${word}`;
    else if (lines.length < 2) lines.push(word);
  }
  if (lines.length === 2 && words.join(" ").length > 34) lines[1] = `${lines[1].slice(0, 15)}…`;
  const title = lines.map((line, index) =>
    `<tspan x="54" dy="${index === 0 ? 0 : 34}">${escapeXml(line)}</tspan>`,
  ).join("");
  const titleY = lines.length > 1 ? 145 : 166;
  const titleSize = lines.some((line) => line.length > 14) ? 29 : 33;
  const category = escapeXml(template.category.toUpperCase());
  const familyPreview = renderFamilyPreview(template.category.toLowerCase(), seed, palette);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="480" viewBox="0 0 720 480">
    <rect width="720" height="480" fill="${palette.paper}"/>
    <circle cx="650" cy="54" r="160" fill="${palette.wash}" opacity=".72"/>
    <rect x="28" y="25" width="664" height="430" rx="20" fill="#ffffff" stroke="#e5e9e4"/>
    <rect x="28" y="25" width="664" height="54" rx="20" fill="#fff"/>
    <path d="M28 59v20h664V59" fill="#fff"/>
    <circle cx="54" cy="52" r="8" fill="${palette.accent}"/>
    <rect x="72" y="46" width="93" height="11" rx="5.5" fill="${palette.ink}" opacity=".82"/>
    <rect x="548" y="44" width="44" height="13" rx="6.5" fill="${palette.wash}"/>
    <rect x="602" y="41" width="67" height="20" rx="8" fill="${palette.accent}"/>
    <text x="54" y="119" fill="${palette.accent}" font-family="Arial,sans-serif" font-size="11" font-weight="700" letter-spacing="2">${category}</text>
    <text x="54" y="${titleY}" fill="${palette.ink}" font-family="Arial,sans-serif" font-size="${titleSize}" font-weight="700" letter-spacing="-1.5">${title}</text>
    <rect x="54" y="184" width="278" height="9" rx="4.5" fill="${palette.muted}" opacity=".23"/>
    <rect x="54" y="202" width="238" height="9" rx="4.5" fill="${palette.muted}" opacity=".16"/>
    <rect x="54" y="235" width="104" height="31" rx="9" fill="${palette.accent}"/>
    <rect x="170" y="235" width="98" height="31" rx="9" fill="#fff" stroke="#e5e9e4"/>
    <rect x="54" y="292" width="304" height="126" rx="12" fill="${palette.wash}"/>
    <rect x="72" y="310" width="104" height="9" rx="4.5" fill="${palette.ink}" opacity=".48"/>
    <rect x="72" y="329" width="184" height="7" rx="3.5" fill="${palette.ink}" opacity=".16"/>
    <rect x="72" y="346" width="160" height="7" rx="3.5" fill="${palette.ink}" opacity=".12"/>
    <rect x="72" y="376" width="84" height="24" rx="7" fill="#fff" opacity=".85"/>
    ${familyPreview}
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
