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
  const bars = Array.from({ length: 7 }, (_, index) => {
    const height = 28 + ((seed >>> (index % 16)) + index * 13) % 70;
    return `<rect x="${410 + index * 23}" y="${314 - height}" width="13" height="${height}" rx="4" fill="${palette.accent}" opacity="${0.46 + (index % 3) * 0.16}"/>`;
  }).join("");
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
    <rect x="378" y="100" width="286" height="318" rx="14" fill="#fff" stroke="#e8ece8"/>
    <text x="398" y="127" fill="${palette.muted}" font-family="Arial,sans-serif" font-size="10" font-weight="700" letter-spacing="1.2">LIVE OVERVIEW</text>
    <rect x="398" y="143" width="118" height="58" rx="9" fill="${palette.paper}" stroke="#edf0eb"/>
    <rect x="528" y="143" width="116" height="58" rx="9" fill="${palette.paper}" stroke="#edf0eb"/>
    <text x="410" y="166" fill="${palette.muted}" font-family="Arial,sans-serif" font-size="9">Projects</text>
    <text x="410" y="188" fill="${palette.ink}" font-family="Arial,sans-serif" font-size="19" font-weight="700">24</text>
    <text x="540" y="166" fill="${palette.muted}" font-family="Arial,sans-serif" font-size="9">This week</text>
    <text x="540" y="188" fill="${palette.ink}" font-family="Arial,sans-serif" font-size="19" font-weight="700">+18%</text>
    <rect x="398" y="218" width="246" height="179" rx="9" fill="${palette.paper}"/>
    <text x="413" y="242" fill="${palette.ink}" font-family="Arial,sans-serif" font-size="11" font-weight="700">A clearer view of progress</text>
    <path d="M410 314h220M410 284h220M410 254h220" stroke="#dfe5df" stroke-width="1"/>
    ${bars}
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
