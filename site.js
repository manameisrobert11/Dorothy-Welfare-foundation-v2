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
