const data = [
  { title:"Community-Led Development", kicker:"Focus Area", desc:"Strengthening local services, livelihoods, and long-term opportunity across the Zambezi Region.", img:"./assets/highlight1.png", link:"./impact.html" },
  { title:"Youth and Women Empowerment", kicker:"Focus Area", desc:"Practical programmes that support skills, enterprise, leadership, and social inclusion.", img:"./assets/highlight2.jpg", link:"./programmes.html" },
  { title:"Agriculture and Enterprise", kicker:"Focus Area", desc:"Helping communities build sustainable income through agriculture, entrepreneurship, and local value chains.", img:"./assets/highlight3.png", link:"./programmes.html" },
  { title:"Culture, Sport and Welfare", kicker:"Focus Area", desc:"Supporting community wellbeing through sport, cultural identity, care, and inclusive participation.", img:"./assets/highlight4.png", link:"./programmes.html" },
  { title:"Accountable Partnerships", kicker:"Focus Area", desc:"Creating trusted pathways for donors, investors, and development partners to support measurable impact.", img:"./assets/highlight5.jpg", link:"./partnerships.html" }
];

const rail = document.getElementById("prioritiesRail");
const dotsWrap = document.getElementById("prioritiesDots");
const prevBtn = document.getElementById("prioritiesPrev");
const nextBtn = document.getElementById("prioritiesNext");

let active = 0;
let timer = null;
let isAnimating = false;

const INTERVAL = 5200;
const LOCK_MS = 520;

function esc(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function renderOnce(){
  if (!rail) return;

  rail.innerHTML = data.map((it,i)=>`
    <article class="pCard ${i===active?"is-active":""}" data-i="${i}" style="--i:${i}" role="button" tabindex="0" aria-label="${esc(it.title)}">
      <div class="pCard__bg" style="background-image:url('${it.img}')"></div>
      <div class="pCard__overlay"></div>
      <div class="pCard__number">${String(i + 1).padStart(2, "0")}</div>
      <div class="pCard__content">
        <p class="pCard__kicker">${esc(it.kicker)}</p>
        <h3 class="pCard__name">${esc(it.title)}</h3>
        <p class="pCard__details">${esc(it.desc)}</p>
        <a class="pCard__link" href="${it.link}">Learn More</a>
      </div>
      <div class="pCard__plus" aria-hidden="true">&rarr;</div>
    </article>
  `).join("");

  if (dotsWrap){
    dotsWrap.innerHTML = data.map((_,i)=>`
      <button class="dot ${i===active?"is-active":""}" data-i="${i}" aria-label="Go to item ${i+1}"></button>
    `).join("");
  }
}

function setActive(nextIndex, user=false){
  if (!rail) return;

  const next = (nextIndex + data.length) % data.length;
  if (next === active || isAnimating) return;

  isAnimating = true;

  const cards = rail.querySelectorAll(".pCard");
  const dots = dotsWrap ? dotsWrap.querySelectorAll(".dot") : [];

  cards.forEach((card, idx) => card.classList.toggle("is-active", idx === next));
  dots.forEach((dot, idx) => dot.classList.toggle("is-active", idx === next));

  active = next;

  if (user){
    const el = rail.querySelector(`.pCard[data-i="${active}"]`);
    el?.scrollIntoView({ behavior:"smooth", inline:"center", block:"nearest" });
  }

  window.setTimeout(()=>{ isAnimating = false; }, LOCK_MS);
}

function start(){
  stop();
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    timer = setInterval(()=>setActive(active + 1), INTERVAL);
  }
}

function stop(){
  if (timer) clearInterval(timer);
  timer = null;
}

function advance(direction){
  stop();
  setActive(active + direction, true);
  start();
}

function wire(){
  if (!rail) return;

  rail.addEventListener("click",(e)=>{
    const card = e.target.closest(".pCard");
    if(!card) return;
    advance(Number(card.dataset.i) - active);
  });

  rail.addEventListener("keydown",(e)=>{
    const card = e.target.closest(".pCard");
    if(!card) return;
    if(e.key==="Enter" || e.key===" "){
      e.preventDefault();
      advance(Number(card.dataset.i) - active);
    }
    if(e.key === "ArrowLeft"){
      e.preventDefault();
      advance(-1);
    }
    if(e.key === "ArrowRight"){
      e.preventDefault();
      advance(1);
    }
  });

  dotsWrap?.addEventListener("click",(e)=>{
    const dot = e.target.closest(".dot");
    if(!dot) return;
    advance(Number(dot.dataset.i) - active);
  });

  prevBtn?.addEventListener("click",()=>advance(-1));
  nextBtn?.addEventListener("click",()=>advance(1));

  rail.addEventListener("mouseenter", stop);
  rail.addEventListener("mouseleave", start);
  rail.addEventListener("focusin", stop);
  rail.addEventListener("focusout", start);

  document.addEventListener("visibilitychange",()=>{
    if (document.hidden) stop();
    else start();
  });
}

renderOnce();
wire();
start();
