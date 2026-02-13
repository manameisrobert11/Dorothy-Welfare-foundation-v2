// Set footer year
const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();

// Smooth scroll for section links
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// -------------------------
// Priorities-style carousel
// -------------------------
const data = [
  {
    title: "Community Transformation",
    kicker: "Key Highlight",
    desc: "Community-driven social and economic transformation in the Zambezi Region.",
    img: "./assets/highlight1.png",
    link: "#impact",
  },
  {
    title: "Youth & Women Empowerment",
    kicker: "Key Highlight",
    desc: "Youth, women, and vulnerable group empowerment programmes.",
    img: "./assets/highlight.png",
    link: "#impact",
  },
  {
    title: "Entrepreneurship & Agriculture",
    kicker: "Key Highlight",
    desc: "Entrepreneurship, agriculture, and livelihood development initiatives.",
    img: "./assets/highlight.png",
    link: "#impact",
  },
  {
    title: "Sports & Culture Support",
    kicker: "Key Highlight",
    desc: "Sports, culture, and indigenous community support.",
    img: "./assets/highlight.png",
    link: "#impact",
  },
  {
    title: "Structured Partnerships",
    kicker: "Key Highlight",
    desc: "Structured partnership platform for investors, donors, and development agencies.",
    img: "./assets/highlight.png",
    link: "#impact",
  },
];

const rail = document.getElementById("prioritiesRail");
const dotsWrap = document.getElementById("prioritiesDots");

let active = 0;
let timer = null;
const INTERVAL = 2000;

function render() {
  if (!rail) return;

  rail.innerHTML = data
    .map(
      (item, i) => `
      <article class="pCard ${i === active ? "is-active" : ""}" data-i="${i}" role="button" tabindex="0" aria-label="${escapeHtml(item.title)}">
        <div class="pCard__bg" style="background-image:url('${item.img}')"></div>
        <div class="pCard__overlay"></div>

        <div class="pCard__content">
          <p class="pCard__kicker">${escapeHtml(item.kicker)}</p>
          <h3 class="pCard__name">${escapeHtml(item.title)}</h3>
          <p class="pCard__details">${escapeHtml(item.desc)}</p>
          <a class="pCard__link" href="${item.link}">Learn More</a>
        </div>

        <div class="pCard__plus" aria-hidden="true">+</div>
      </article>
    `
    )
    .join("");

  if (dotsWrap) {
    dotsWrap.innerHTML = data
      .map(
        (_, i) =>
          `<button class="dot ${i === active ? "is-active" : ""}" data-i="${i}" aria-label="Go to item ${i + 1}"></button>`
      )
      .join("");
  }
}

function setActive(i, { user = false } = {}) {
  const next = (i + data.length) % data.length;
  if (next === active) return;

  rail?.classList.add("is-switching");

  window.requestAnimationFrame(() => {
    active = next;
    render();

    if (user && rail) {
      const card = rail.querySelector(`.pCard[data-i="${active}"]`);
      card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }

    setTimeout(() => rail?.classList.remove("is-switching"), 120);
  });
}

function start() {
  stop();
  timer = setInterval(() => setActive(active + 1), INTERVAL);
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

function wireEvents() {
  if (!rail) return;

  rail.addEventListener("click", (e) => {
    const card = e.target.closest(".pCard");
    if (!card) return;
    setActive(Number(card.dataset.i), { user: true });
  });

  rail.addEventListener("keydown", (e) => {
    const card = e.target.closest(".pCard");
    if (!card) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActive(Number(card.dataset.i), { user: true });
    }
  });

  dotsWrap?.addEventListener("click", (e) => {
    const dot = e.target.closest(".dot");
    if (!dot) return;
    setActive(Number(dot.dataset.i), { user: true });
  });

  rail.addEventListener("mouseenter", stop);
  rail.addEventListener("mouseleave", start);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();
wireEvents();
start();
// -------- Navbar active state (based on scroll) --------
const navLinks = Array.from(document.querySelectorAll(".pillnav__pill"));
const sections = navLinks
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

function setActiveNavById(id) {
  navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`));
}

function onScrollSetActiveNav() {
  // find the section closest to top
  let current = sections[0]?.id;
  const top = window.scrollY + 140;
  for (const s of sections) {
    if (s.offsetTop <= top) current = s.id;
  }
  if (current) setActiveNavById(current);
}

window.addEventListener("scroll", onScrollSetActiveNav, { passive: true });
window.addEventListener("load", onScrollSetActiveNav);

// -------- Search UI behaviour (basic for now) --------
const searchInput = document.getElementById("siteSearch");
const searchBtn = document.getElementById("siteSearchBtn");

function runSearch() {
  const q = (searchInput?.value || "").trim();
  if (!q) return;

  // For now: simple “jump to matching section heading” behaviour.
  // Later: we can add a dropdown + real results.
  const candidates = document.querySelectorAll("h1,h2,h3,p,a,li");
  const needle = q.toLowerCase();

  let found = null;
  for (const el of candidates) {
    if ((el.textContent || "").toLowerCase().includes(needle)) {
      found = el;
      break;
    }
  }

  if (found) {
    found.scrollIntoView({ behavior: "smooth", block: "center" });
    found.style.outline = "3px solid rgba(159,227,214,.85)";
    found.style.outlineOffset = "4px";
    setTimeout(() => {
      found.style.outline = "";
      found.style.outlineOffset = "";
    }, 1200);
  }
}

searchBtn?.addEventListener("click", runSearch);
searchInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runSearch();
});
