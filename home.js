const data = [
  { title:"Community Transformation", kicker:"Key Highlight", desc:"Community-driven social and economic transformation in the Zambezi Region.", img:"./assets/highlight1.png", link:"./impact.html" },
  { title:"Youth & Women Empowerment", kicker:"Key Highlight", desc:"Youth, women, and vulnerable group empowerment programmes.", img:"./assets/highlight2.png", link:"./programmes.html" },
  { title:"Entrepreneurship & Agriculture", kicker:"Key Highlight", desc:"Entrepreneurship, agriculture, and livelihood development initiatives.", img:"./assets/highlight3.png", link:"./programmes.html" },
  { title:"Sports & Culture Support", kicker:"Key Highlight", desc:"Sports, culture, and indigenous community support.", img:"./assets/highlight4.png", link:"./programmes.html" },
  { title:"Structured Partnerships", kicker:"Key Highlight", desc:"Structured partnership platform for investors, donors, and development agencies.", img:"./assets/highlight5.png", link:"./partnerships.html" }
];

const rail = document.getElementById("prioritiesRail");
const dotsWrap = document.getElementById("prioritiesDots");

let active = 0;
let timer = null;
const INTERVAL = 2000;

function esc(s){return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}

function render() {
  if (!rail) return;
  rail.innerHTML = data.map((it,i)=>`
    <article class="pCard ${i===active?"is-active":""}" data-i="${i}" role="button" tabindex="0" aria-label="${esc(it.title)}">
      <div class="pCard__bg" style="background-image:url('${it.img}')"></div>
      <div class="pCard__overlay"></div>
      <div class="pCard__content">
        <p class="pCard__kicker">${esc(it.kicker)}</p>
        <h3 class="pCard__name">${esc(it.title)}</h3>
        <p class="pCard__details">${esc(it.desc)}</p>
        <a class="pCard__link" href="${it.link}">Learn More</a>
      </div>
      <div class="pCard__plus" aria-hidden="true">+</div>
    </article>
  `).join("");

  if (dotsWrap){
    dotsWrap.innerHTML = data.map((_,i)=>`<button class="dot ${i===active?"is-active":""}" data-i="${i}" aria-label="Go to item ${i+1}"></button>`).join("");
  }
}

function setActive(i, user=false){
  const next = (i + data.length) % data.length;
  if (next === active) return;

  rail?.classList.add("is-switching");
  requestAnimationFrame(()=>{
    active = next;
    render();
    if (user) rail?.querySelector(`.pCard[data-i="${active}"]`)?.scrollIntoView({behavior:"smooth", inline:"center", block:"nearest"});
    setTimeout(()=>rail?.classList.remove("is-switching"), 120);
  });
}

function start(){ stop(); timer = setInterval(()=>setActive(active+1), INTERVAL); }
function stop(){ if (timer) clearInterval(timer); timer=null; }

function wire(){
  if (!rail) return;
  rail.addEventListener("click",(e)=>{ const c=e.target.closest(".pCard"); if(!c) return; setActive(Number(c.dataset.i), true); });
  rail.addEventListener("keydown",(e)=>{ const c=e.target.closest(".pCard"); if(!c) return; if(e.key==="Enter"||e.key===" "){ e.preventDefault(); setActive(Number(c.dataset.i), true);} });
  dotsWrap?.addEventListener("click",(e)=>{ const d=e.target.closest(".dot"); if(!d) return; setActive(Number(d.dataset.i), true); });
  rail.addEventListener("mouseenter", stop);
  rail.addEventListener("mouseleave", start);
}

render(); wire(); start();
