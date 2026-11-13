import type { Template } from "./templates";

type FreeTemplateBlueprint = Omit<Template, "code" | "price" | "rating" | "uses" | "isPremium" | "tech"> & {
  accent: string;
  wash: string;
  eyebrow: string;
  headline: string;
  intro: string;
  primaryAction: string;
  secondaryAction: string;
  highlights: Array<{ title: string; copy: string }>;
  details: Array<{ label: string; value: string }>;
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);

function renderFreeSections(blueprint: FreeTemplateBlueprint, highlights: string, details: string) {
  switch (blueprint.id) {
    case "free-cafe-one-page":
      return `<section id="story" class="section"><div class="section-head"><h2>On the menu today.</h2><p>Seasonal favourites from the counter.</p></div><div class="features">${highlights}</div></section>
        <section id="details" class="section"><div class="section-head"><h2>Make yourself at home.</h2><p>Everything you need before you stop by.</p></div><div class="details">${details}</div></section>
        <section id="contact" class="contact"><div><h2>There is a table for you.</h2><p>Replace this sample address and hours with your café details.</p></div><a class="button" href="mailto:hello@example.com">Plan a visit&nbsp;↗</a></section>`;
    case "free-creator-portfolio":
      return `<section id="story" class="section"><div class="section-head"><h2>Selected projects.</h2><p>A few thoughtful collaborations, from first question to final detail.</p></div><div class="features">${highlights}</div></section>
        <section id="details" class="section"><div class="section-head"><h2>Practice notes.</h2><p>Share the context, craft and availability behind your work.</p></div><div class="details">${details}</div></section>
        <section id="contact" class="contact"><div><h2>Have a good question?</h2><p>Tell me what you are making and where you need a hand.</p></div><a class="button" href="mailto:hello@example.com">Start a conversation&nbsp;↗</a></section>`;
    case "free-community-event":
      return `<section id="details" class="section"><div class="section-head"><h2>The day at a glance.</h2><p>Plan your visit with the essential event details.</p></div><div class="details">${details}</div></section>
        <section id="story" class="section"><div class="section-head"><h2>A day for sharing ideas.</h2><p>Thoughtful sessions, useful conversations and room to meet.</p></div><div class="features">${highlights}</div></section>
        <section id="contact" class="contact"><div><h2>Save your place.</h2><p>Connect a registration service before collecting attendee details.</p></div><a class="button" href="mailto:hello@example.com">Register interest&nbsp;↗</a></section>`;
    case "free-wellness-studio":
      return `<section id="story" class="section"><div class="section-head"><h2>Find a class that feels right.</h2><p>Clear formats help first-time visitors choose with confidence.</p></div><div class="features">${highlights}</div></section>
        <section id="details" class="section"><div class="section-head"><h2>Your studio, before you arrive.</h2><p>Practical details for a calm first visit.</p></div><div class="details">${details}</div></section>
        <section id="contact" class="contact"><div><h2>Come as you are.</h2><p>Replace this example with your real timetable and booking link.</p></div><a class="button" href="mailto:hello@example.com">Explore classes&nbsp;↗</a></section>`;
    default:
      return `<section id="story" class="section"><div class="section-head"><h2>What is coming together.</h2><p>A clear product story, without promises before the product is ready.</p></div><div class="features">${highlights}</div></section>
        <section id="details" class="section"><div class="section-head"><h2>Milestones, in the open.</h2><p>Keep early supporters informed about what is ready and what comes next.</p></div><div class="details">${details}</div></section>
        <section id="contact" class="contact"><div><h2>Get the occasional useful update.</h2><p>Connect a consent-aware email service before collecting sign-ups.</p></div><a class="button" href="mailto:hello@example.com">Join the early list&nbsp;↗</a></section>`;
  }
}

function renderFreeHeroVisual(blueprint: FreeTemplateBlueprint) {
  const firstDetail = escapeHtml(blueprint.details[0].value);
  if (blueprint.id === "free-cafe-one-page") {
    return `<div class="visual-art" data-art="cafe"><div><span class="art-kicker">TODAY'S FAVOURITE</span><strong>${firstDetail}</strong><span>House-made · served all day</span></div></div>`;
  }
  if (blueprint.id === "free-creator-portfolio") {
    return `<div class="visual-art" data-art="portfolio"><div class="project-wall"><span>01<br>IDENTITY</span><span>02<br>DIGITAL</span><span>03<br>DIRECTION</span></div></div>`;
  }
  if (blueprint.id === "free-community-event") {
    return `<div class="visual-art" data-art="event"><div class="event-card"><span>COMMUNITY DAY</span><strong>${firstDetail}</strong><span>Talks&nbsp; · &nbsp;Workshops&nbsp; · &nbsp;People</span></div></div>`;
  }
  if (blueprint.id === "free-wellness-studio") {
    return `<div class="visual-art" data-art="wellness"><div class="class-card"><span>THIS WEEK</span><strong>${firstDetail}</strong><span>Move at your own pace</span></div></div>`;
  }
  return `<div class="visual-art" data-art="waitlist"><div class="launch-card"><span>IN DEVELOPMENT</span><strong>${firstDetail}</strong><span class="launch-track"><i></i></span><span>Building with early feedback</span></div></div>`;
}

function buildFreeTemplate(blueprint: FreeTemplateBlueprint): Template {
  const { accent, wash, eyebrow, headline, intro, primaryAction, secondaryAction } = blueprint;
  const highlights = blueprint.highlights.map(({ title, copy }, index) => `
    <article class="feature">
      <span class="feature-index">0${index + 1}</span>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(copy)}</p>
    </article>`).join("");
  const details = blueprint.details.map(({ label, value }) => `
    <div class="detail"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
  const sections = renderFreeSections(blueprint, highlights, details);
  const heroVisual = renderFreeHeroVisual(blueprint);
  const navigation = blueprint.id === "free-cafe-one-page"
    ? `<a href="#story">Menu</a><a href="#details">Visit</a><a href="#contact">Contact</a>`
    : blueprint.id === "free-creator-portfolio"
      ? `<a href="#story">Selected work</a><a href="#details">Practice</a><a href="#contact">Contact</a>`
      : blueprint.id === "free-community-event"
        ? `<a href="#details">Schedule</a><a href="#story">About</a><a href="#contact">Register</a>`
        : blueprint.id === "free-wellness-studio"
          ? `<a href="#story">Classes</a><a href="#details">The studio</a><a href="#contact">First visit</a>`
          : `<a href="#story">The product</a><a href="#details">Milestones</a><a href="#contact">Updates</a>`;

  const code = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(blueprint.description)}">
  <title>${escapeHtml(blueprint.name)}</title>
  <style>
    :root{color-scheme:light;--ink:#17211f;--muted:#66716d;--paper:#f8f8f4;--surface:#fff;--line:#e4e8e2;--accent:${accent};--wash:${wash};font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);line-height:1.6}a{color:inherit;text-decoration:none}.shell{width:min(1120px,calc(100% - 40px));margin:auto}
    .nav{height:76px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line)}.brand{font-weight:800;letter-spacing:-.04em;font-size:1.1rem}.brand-mark{display:inline-grid;place-items:center;width:30px;height:30px;margin-right:9px;border-radius:10px;background:var(--accent);color:white}
    .nav-links{display:flex;gap:26px;color:var(--muted);font-size:.9rem}.nav-cta,.button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 18px;border:1px solid var(--accent);border-radius:8px;background:var(--accent);color:white;font-weight:650}.button.secondary{background:transparent;color:var(--ink);border-color:var(--line)}
    .hero{display:grid;grid-template-columns:1.15fr .85fr;align-items:center;gap:44px;padding:88px 0 76px}.eyebrow{display:inline-flex;padding:6px 11px;border:1px solid var(--line);border-radius:999px;background:var(--surface);color:var(--accent);font-size:.75rem;font-weight:750;letter-spacing:.08em;text-transform:uppercase}.hero h1{max-width:720px;margin:18px 0;font-size:clamp(2.6rem,6vw,5rem);line-height:1.02;letter-spacing:-.065em}.hero p{max-width:570px;color:var(--muted);font-size:1.1rem}.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:27px}
    .visual{position:relative;min-height:330px;padding:22px;border:1px solid var(--line);border-radius:18px;background:linear-gradient(145deg,var(--wash),white 70%);box-shadow:0 24px 70px #18251a12}.visual-top{display:flex;justify-content:space-between;color:var(--muted);font-size:.8rem}.visual-art{display:grid;place-items:center;min-height:210px;margin-top:20px;border-radius:12px;background:linear-gradient(145deg,var(--accent),#17211f);color:#fff;text-align:center}.visual-art strong{display:block;font-size:clamp(2rem,4vw,3.8rem);line-height:1;letter-spacing:-.06em}.visual-art span{display:block;margin-top:12px;opacity:.8}
    .visual-art[data-art="cafe"]{background:radial-gradient(circle at 75% 20%,#b86e4c,var(--accent) 48%,#3c2922)}.visual-art[data-art="cafe"] strong{font-family:Georgia,serif;font-size:clamp(1.7rem,3vw,2.7rem)}
    .visual-art[data-art="portfolio"]{padding:18px;background:#d8e2dc}.project-wall{display:grid;width:100%;height:100%;grid-template-columns:1.2fr .8fr;grid-template-rows:1fr 1fr;gap:10px}.project-wall span{display:flex;align-items:end;padding:12px;border-radius:8px;background:linear-gradient(145deg,#8ca99a,#315f53);text-align:left;font-size:.72rem;font-weight:750}.project-wall span:first-child{grid-row:span 2;background:linear-gradient(145deg,#d9ba9d,#6d5847)}
    .visual-art[data-art="event"]{background:linear-gradient(135deg,#dce0f7,#4859a6)}.event-card,.class-card,.launch-card{width:min(100%,290px);padding:18px;border:1px solid #ffffff70;border-radius:12px;background:#ffffffed;color:var(--ink);text-align:left}.event-card>span:first-child,.class-card>span:first-child,.launch-card>span:first-child{margin:0;color:var(--accent);font-size:.68rem;font-weight:800;letter-spacing:.08em}.event-card strong,.class-card strong,.launch-card strong{margin-top:12px;font-size:1.5rem}.event-card>span:last-child,.class-card>span:last-child,.launch-card>span:last-child{margin-top:10px;color:var(--muted);font-size:.8rem}
    .visual-art[data-art="wellness"]{background:radial-gradient(circle at 30% 25%,#b6c4a8,var(--accent) 62%,#37483a)}.class-card{border-radius:50px 12px 50px 12px}.class-card strong{font-family:Georgia,serif}
    .visual-art[data-art="waitlist"]{background:linear-gradient(135deg,#d9e3ef,#405d87)}.launch-track{height:7px;margin-top:18px;border-radius:9px;background:#dfe4eb}.launch-track i{display:block;width:68%;height:100%;border-radius:inherit;background:var(--accent)}
    .section{padding:52px 0}.section-head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:22px}.section h2{margin:0;font-size:clamp(1.7rem,3vw,2.4rem);letter-spacing:-.05em}.section-head p{max-width:460px;margin:0;color:var(--muted)}.features{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.feature,.contact{padding:23px;border:1px solid var(--line);border-radius:12px;background:var(--surface)}.feature-index{color:var(--accent);font-size:.8rem;font-weight:800}.feature h3{margin:28px 0 6px;font-size:1.1rem}.feature p{margin:0;color:var(--muted);font-size:.92rem}.details{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.detail{padding:18px;border-radius:10px;background:var(--wash)}.detail span,.detail strong{display:block}.detail span{color:var(--muted);font-size:.8rem}.detail strong{margin-top:5px}
    .contact{display:flex;justify-content:space-between;align-items:center;gap:20px;margin:45px 0 60px}.contact h2{margin:0;font-size:1.5rem}.contact p{margin:4px 0 0;color:var(--muted)}footer{padding:24px 0;border-top:1px solid var(--line);color:var(--muted);font-size:.82rem}
    @media(max-width:760px){.shell{width:min(100% - 28px,560px)}.nav{height:64px}.nav-links{display:none}.nav-cta{min-height:38px;padding:0 12px;font-size:.84rem}.hero{grid-template-columns:1fr;gap:26px;padding:54px 0 42px}.hero h1{font-size:clamp(2.45rem,12vw,4rem)}.visual{min-height:270px}.visual-art{min-height:170px}.features,.details{grid-template-columns:1fr}.section-head,.contact{align-items:flex-start;flex-direction:column}.section{padding:34px 0}}
    @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{transition:none!important}}
  </style>
</head>
<body>
  <header class="shell nav">
    <a class="brand" href="#top"><span class="brand-mark" aria-hidden="true">✦</span>${escapeHtml(blueprint.name)}</a>
    <nav class="nav-links" aria-label="Main navigation">${navigation}</nav>
    <a class="nav-cta" href="#contact">${escapeHtml(primaryAction)}</a>
  </header>
  <main id="top" class="shell" data-template="${escapeHtml(blueprint.id)}">
    <section class="hero">
      <div><span class="eyebrow">${escapeHtml(eyebrow)}</span><h1>${escapeHtml(headline)}</h1><p>${escapeHtml(intro)}</p>
        <div class="actions"><a class="button" href="#contact">${escapeHtml(primaryAction)} <span aria-hidden="true">&nbsp;↗</span></a><a class="button secondary" href="#story">${escapeHtml(secondaryAction)}</a></div>
      </div>
      <div class="visual" aria-label="Template visual preview"><div class="visual-top"><span>${escapeHtml(blueprint.name)}</span><span>${escapeHtml(blueprint.details[0].label)}</span></div>${heroVisual}</div>
    </section>
    ${sections}
  </main>
  <footer><div class="shell">© 2026 ${escapeHtml(blueprint.name)}. A free, editable starter template.</div></footer>
</body>
</html>`;

  return {
    ...blueprint,
    tech: ["HTML", "CSS"],
    price: 0,
    rating: 0,
    uses: 0,
    isPremium: false,
    code,
  };
}

const blueprints: FreeTemplateBlueprint[] = [
  {
    id: "free-cafe-one-page",
    name: "Sunday Table Café",
    description: "A welcoming one-page website for an independent café, with a concise menu preview, opening details and a clear visit call to action.",
    category: "business",
    accent: "#a45131",
    wash: "#f6e8df",
    eyebrow: "Neighbourhood café · Open daily",
    headline: "Good coffee. Longer mornings.",
    intro: "A warm, uncomplicated home for a local coffee shop, bakery or neighbourhood restaurant.",
    primaryAction: "Find us",
    secondaryAction: "Our story",
    highlights: [
      { title: "Made with care", copy: "Share your house blend, seasonal bakes and the people behind the counter." },
      { title: "A simple menu", copy: "Put the favourites up front and make dietary notes easy to find." },
      { title: "Local by nature", copy: "Tell visitors where you are, when you open and how to get in touch." },
    ],
    details: [
      { label: "Today", value: "08:00 — 18:00" },
      { label: "House favourite", value: "Citrus flat white" },
      { label: "Find us", value: "Old Town · Main Street" },
    ],
  },
  {
    id: "free-creator-portfolio",
    name: "Fieldnotes Portfolio",
    description: "A lightweight portfolio starter for independent designers, writers and makers, with a featured work section and a direct contact call to action.",
    category: "portfolio",
    accent: "#315f53",
    wash: "#e5eee9",
    eyebrow: "Independent creative · Available for select work",
    headline: "A little clarity changes everything.",
    intro: "Introduce your practice, share a few thoughtful projects and make it easy for the right people to reach you.",
    primaryAction: "Start a conversation",
    secondaryAction: "Selected work",
    highlights: [
      { title: "Show the thinking", copy: "Pair each project with the brief, the decisions and the result." },
      { title: "Keep it personal", copy: "A concise introduction helps clients understand how you work." },
      { title: "Stay focused", copy: "A quiet layout gives your best work room to speak." },
    ],
    details: [
      { label: "Practice", value: "Brand · Digital · Direction" },
      { label: "Based in", value: "Copenhagen · Working everywhere" },
      { label: "Next availability", value: "January 2027" },
    ],
  },
  {
    id: "free-community-event",
    name: "Common Ground Event",
    description: "A clean event landing page for a local meetup, workshop or community gathering, with schedule highlights and location details.",
    category: "business",
    accent: "#4859a6",
    wash: "#e9eafa",
    eyebrow: "Community gathering · Autumn 2027",
    headline: "Make room for good ideas.",
    intro: "Give a small event a clear home with the essential details, a welcoming tone and a simple route to register.",
    primaryAction: "Reserve a place",
    secondaryAction: "View the schedule",
    highlights: [
      { title: "A useful schedule", copy: "Set expectations with session times, speakers and a few breaks." },
      { title: "People first", copy: "Explain who the gathering is for and what attendees will take away." },
      { title: "Easy to attend", copy: "Keep the venue, access notes and contact details close at hand." },
    ],
    details: [
      { label: "When", value: "Saturday · 10:00—16:00" },
      { label: "Where", value: "The Foundry · City Centre" },
      { label: "Format", value: "Talks · Workshops · Lunch" },
    ],
  },
  {
    id: "free-wellness-studio",
    name: "Stillwell Movement",
    description: "A calm starter site for a yoga, Pilates or movement studio, introducing the practice, class formats and studio information.",
    category: "business",
    accent: "#58735a",
    wash: "#e8eee3",
    eyebrow: "Movement for real life",
    headline: "Find your own steady rhythm.",
    intro: "A welcoming first page for a small studio, built to make the approach and next step feel approachable.",
    primaryAction: "Explore classes",
    secondaryAction: "Meet the studio",
    highlights: [
      { title: "Classes for every pace", copy: "Describe beginner-friendly, restorative and more energetic sessions." },
      { title: "People make the practice", copy: "Introduce instructors and the values that shape the room." },
      { title: "A clear first visit", copy: "Explain what to bring, where to go and how to prepare." },
    ],
    details: [
      { label: "Weekly classes", value: "18 guided sessions" },
      { label: "Studio style", value: "Small groups · All levels" },
      { label: "First visit", value: "Intro class · €12" },
    ],
  },
  {
    id: "free-product-waitlist",
    name: "Launch Letter Waitlist",
    description: "A focused product waitlist page for validating an early idea, with a clear value proposition, three benefits and a visible launch milestone.",
    category: "saas",
    accent: "#405d87",
    wash: "#e8edf4",
    eyebrow: "A small idea, almost ready",
    headline: "Make the next step feel lighter.",
    intro: "Explain the product in plain language, invite early interest and keep the story focused on the people it helps.",
    primaryAction: "Join the early list",
    secondaryAction: "See what is coming",
    highlights: [
      { title: "One clear promise", copy: "Lead with the problem you solve and why the approach is different." },
      { title: "A useful preview", copy: "Show the workflow or the small details that make the product worthwhile." },
      { title: "Honest momentum", copy: "Share what is ready, what is next and when people can expect an update." },
    ],
    details: [
      { label: "Next milestone", value: "Private beta · Q1 2027" },
      { label: "Early access", value: "First 250 members" },
      { label: "Updates", value: "Occasional · No noise" },
    ],
  },
];

export const ADDITIONAL_FREE_TEMPLATES = blueprints.map(buildFreeTemplate);
