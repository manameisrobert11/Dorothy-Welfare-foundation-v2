// Footer year
const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();

// Active nav (based on current file name)
const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
document.querySelectorAll(".pillnav__pill").forEach((a) => {
  const href = (a.getAttribute("href") || "").split("/").pop()?.toLowerCase();
  if (href === here) a.classList.add("is-active");
});

// Search (simple, professional behavior)
const searchInput = document.getElementById("siteSearch");
const searchBtn = document.getElementById("siteSearchBtn");

function runSearch() {
  const q = (searchInput?.value || "").trim().toLowerCase();
  if (!q) return;

  const targets = document.querySelectorAll("h1,h2,h3,h4,p,li,a");
  let found = null;
  for (const el of targets) {
    if ((el.textContent || "").toLowerCase().includes(q)) { found = el; break; }
  }

  if (found) {
    found.scrollIntoView({ behavior: "smooth", block: "center" });
    found.style.outline = "3px solid rgba(159,227,214,.85)";
    found.style.outlineOffset = "4px";
    setTimeout(() => { found.style.outline = ""; found.style.outlineOffset = ""; }, 1200);
  }
}

searchBtn?.addEventListener("click", runSearch);
searchInput?.addEventListener("keydown", (e) => { if (e.key === "Enter") runSearch(); });


// Mobile menu (drawer)
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const menuClose = document.getElementById("menuClose");

function openMenu(){
  if (!mobileMenu) return;
  mobileMenu.classList.add("is-open");
  mobileMenu.setAttribute("aria-hidden","false");
  menuBtn?.setAttribute("aria-expanded","true");
  document.body.classList.add("noScroll");
}
function closeMenu(){
  if (!mobileMenu) return;
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden","true");
  menuBtn?.setAttribute("aria-expanded","false");
  document.body.classList.remove("noScroll");
}

menuBtn?.addEventListener("click", () => {
  if (mobileMenu?.classList.contains("is-open")) closeMenu();
  else openMenu();
});
menuClose?.addEventListener("click", closeMenu);
mobileMenu?.addEventListener("click", (e) => {
  if (e.target === mobileMenu) closeMenu(); // click backdrop
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

// Mobile search hooks (shares same search behavior)
const searchInputMobile = document.getElementById("siteSearchMobile");
const searchBtnMobile = document.getElementById("siteSearchBtnMobile");
searchBtnMobile?.addEventListener("click", runSearchMobile);
searchInputMobile?.addEventListener("keydown", (e) => { if (e.key === "Enter") runSearchMobile(); });

function runSearchMobile(){
  const q = (searchInputMobile?.value || "").trim().toLowerCase();
  if (!q) return;
  // copy query into desktop search if present (optional)
  if (searchInput) searchInput.value = q;
  runSearch();
  closeMenu();
}

// Active nav for mobile links too
document.querySelectorAll(".mnav__link").forEach((a) => {
  const href = (a.getAttribute("href") || "").split("/").pop()?.toLowerCase();
  if (href === here) a.classList.add("is-active");
});
