/* ==========================================================
   Just Print — página principal
   ========================================================== */

/* ---------- servicios (tarjetas) ---------- */
const grid = $("#grid");
grid.innerHTML = SERVICES.map((s, i) => `
  <button class="card reveal${s.wide ? " card--wide" : ""}" style="--accent:${s.color};--d:${(i % 3) * .08}s" data-id="${s.id}" aria-haspopup="dialog">
    <span class="card__img">
      <img src="assets/img/c-${s.img}.webp" alt="${esc(s.title)}" loading="lazy">
      <span class="card__tag">${esc(s.tag)}</span>
    </span>
    <span class="card__body">
      <span>
        <span class="card__title">${esc(s.title)}</span>
        <span class="card__sub" style="display:block">${esc(s.sub)}</span>
      </span>
      <span class="card__plus" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </span>
    </span>
  </button>`).join("");
// los .reveal creados aquí no existían cuando common.js armó su observer
(function () {
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
  }), { threshold: .12, rootMargin: "0px 0px -6% 0px" });
  $$(".card.reveal", grid).forEach(c => io.observe(c));
})();

grid.addEventListener("pointermove", e => {
  const c = e.target.closest(".card");
  if (!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty("--mx", e.clientX - r.left + "px");
  c.style.setProperty("--my", e.clientY - r.top + "px");
});

/* ---------- filtros de servicios ---------- */
(function chips() {
  const box = $("#chips");
  if (!box) return;
  box.addEventListener("click", e => {
    const b = e.target.closest(".chip-btn");
    if (!b) return;
    $$(".chip-btn", box).forEach(x => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-pressed", x === b); });
    const cat = b.dataset.cat;
    grid.classList.toggle("grid--filtered", cat !== "all");
    $$(".card", grid).forEach(c => {
      const s = SERVICES.find(x => x.id === c.dataset.id);
      const show = cat === "all" || (s.cats || []).includes(cat);
      c.hidden = !show;
      c.classList.remove("is-pop");
      if (show) {
        c.classList.add("is-in");
        void c.offsetWidth;                 // reinicia la animación
        c.classList.add("is-pop");
      }
    });
  });
})();

/* ---------- ventana de detalle ---------- */
const sheet = $("#sheet");
const panel = $(".sheet__panel", sheet);
let lastFocus = null;

function openSheet(id) {
  const s = SERVICES.find(x => x.id === id);
  if (!s) return;
  lastFocus = document.activeElement;
  panel.style.setProperty("--accent", s.color);
  $("#sheetImg").src = `assets/img/m-${s.img}.webp`;
  $("#sheetImg").alt = s.title;
  $("#sheetEyebrow").textContent = s.tag;
  $("#sheetTitle").textContent = s.title;
  $("#sheetText").innerHTML = s.text.map(t => `<p>${esc(t)}</p>`).join("");
  $("#sheetList").innerHTML = s.list.map(t => `<li>${esc(t)}</li>`).join("");
  $("#sheetCta").dataset.service = s.title;
  $("#sheetPage").href = `servicios/${s.id}.html`;
  $(".sheet__body", sheet).scrollTop = 0;
  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-locked");
  requestAnimationFrame(() => panel.focus({ preventScroll: true }));
}
function closeSheet() {
  sheet.classList.remove("is-open");
  sheet.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-locked");
  if (lastFocus) lastFocus.focus({ preventScroll: true });
}
grid.addEventListener("click", e => {
  const c = e.target.closest(".card");
  if (c) openSheet(c.dataset.id);
});
sheet.addEventListener("click", e => { if (e.target.closest("[data-close]")) closeSheet(); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && sheet.classList.contains("is-open")) closeSheet();
});
$("#sheetCta").addEventListener("click", e => {
  const svc = e.currentTarget.dataset.service;
  if (svc) sel.value = svc;
  closeSheet();
});

/* ---------- galería "Nuestro trabajo": scroll horizontal fijo (escritorio) ---------- */
(function work() {
  const sec = $("[data-work]"), track = $("#workTrack"), bar = $("[data-work-bar]");
  if (!sec || !track || typeof GALLERY === "undefined") return;
  GALLERY.forEach(g => {
    const s = SERVICES.find(x => x.id === g.service);
    track.insertAdjacentHTML("beforeend", `
      <a class="wcard" href="servicios/${esc(g.service)}.html" style="--accent:${s ? s.color : "#35a2db"}">
        <img src="assets/img/${esc(g.img)}" alt="${esc(g.title)}" decoding="async" draggable="false">
        <span class="wcard__cap"><span>${esc(s ? s.tag : "")}</span><strong>${esc(g.title)}</strong></span>
      </a>`);
  });

  const mq = window.matchMedia("(min-width: 900px)");
  let pinned = false, overflow = 0, raf = 0;
  function measure() {
    pinned = mq.matches && !reduceMotion;
    sec.classList.toggle("is-pinned", pinned);
    if (!pinned) { sec.style.height = ""; track.style.transform = ""; return; }
    overflow = Math.max(0, track.scrollWidth - window.innerWidth);
    sec.style.height = (window.innerHeight + overflow) + "px";
    tick();
  }
  function tick() {
    raf = 0;
    if (!pinned) return;
    const r = sec.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(1, sec.offsetHeight - window.innerHeight));
    track.style.transform = `translate3d(${(-p * overflow).toFixed(1)}px,0,0)`;
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
  }
  window.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);
  mq.addEventListener("change", measure);
  measure();
})();

/* ---------- clientes y testimonios (solo si hay datos en config.js) ---------- */
(function optional() {
  if (typeof CLIENTS !== "undefined" && CLIENTS.length) {
    $("#clientsRow").innerHTML = CLIENTS.map(c => c.logo
      ? `<img src="${esc(c.logo)}" alt="${esc(c.name)}" loading="lazy">`
      : `<span>${esc(c.name)}</span>`).join("");
    $("#clientes").hidden = false;
  }
  if (typeof TESTIMONIALS !== "undefined" && TESTIMONIALS.length) {
    $("#testiRow").innerHTML = TESTIMONIALS.map(t => `
      <figure class="tcard">
        <blockquote>“${esc(t.text)}”</blockquote>
        <figcaption><strong>${esc(t.name)}</strong><span>${esc(t.role || "")}</span></figcaption>
      </figure>`).join("");
    $("#testimonios").hidden = false;
  }
})();

/* ---------- contador ---------- */
const counter = $("[data-count]");
if (counter && !reduceMotion) {
  const target = +counter.dataset.count;
  counter.textContent = "0";
  const cio = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting) return;
    cio.disconnect();
    const t0 = performance.now(), dur = 1400;
    (function tick(t) {
      const k = clamp((t - t0) / dur);
      counter.textContent = Math.round(target * (1 - Math.pow(1 - k, 4)));
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }, { threshold: .6 });
  cio.observe(counter);
}

/* ---------- frase que se ilumina palabra por palabra ---------- */
const words = $("[data-words]");
const wordEls = [];
if (words) {
  const text = words.textContent.trim().replace(/\s+/g, " ");
  words.setAttribute("aria-label", text);
  words.innerHTML = text.split(" ").map(w => `<span class="word" aria-hidden="true">${esc(w)}</span>`).join(" ");
  wordEls.push(...$$(".word", words));
}

/* ---------- scroll: lo ligado al desplazamiento ---------- */
const hero = $("[data-hero]");
const heroFrame = $("[data-hero-frame]");
const statement = $("[data-statement]");
const catalog = $("[data-catalog]");
const about = $(".about");
const sections = ["servicios", "proceso", "porque", "trabajo", "nosotros", "catalogo", "preguntas", "contacto"].map(id => [id, document.getElementById(id)]);
const navAnchors = $$(".nav__links a");
let ticking = false;

function update() {
  ticking = false;
  const vh = window.innerHeight;

  if (!reduceMotion) {
    const hr = hero.getBoundingClientRect();
    if (hr.bottom > 0) {
      const fr = heroFrame.getBoundingClientRect();
      hero.style.setProperty("--p", clamp(1 - (fr.top - vh * .12) / (vh * .75)).toFixed(4));
    }
    if (statement && wordEls.length) {
      const r = statement.getBoundingClientRect();
      const p = clamp((vh * .82 - r.top) / (r.height * .8 + vh * .1));
      const n = Math.floor(p * wordEls.length * 1.12);
      wordEls.forEach((w, i) => w.classList.toggle("on", i < n));
    }
    if (about) {
      const r = about.getBoundingClientRect();
      about.style.setProperty("--p", clamp((vh - r.top) / (vh + r.height)).toFixed(4));
    }
    if (catalog) {
      const r = catalog.getBoundingClientRect();
      catalog.style.setProperty("--p", clamp((vh - r.top) / (vh + r.height)).toFixed(4));
    }
  }

  let current = "";
  sections.forEach(([id, el]) => { if (el && el.getBoundingClientRect().top <= vh * .4) current = id; });
  navAnchors.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + current));
}
function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
update();

/* ---------- proceso: pasos con flechas (o tocando cada paso) ---------- */
(function processSteps() {
  const steps = $$("[data-step]");
  const imgs = $$("[data-step-img]");
  const count = $("[data-step-count]");
  if (!steps.length) return;
  let cur = 0;
  function go(i) {
    cur = (i + steps.length) % steps.length;
    steps.forEach((s, k) => s.classList.toggle("is-active", k === cur));
    imgs.forEach((im, k) => im.classList.toggle("is-active", k === cur));
    if (count) count.textContent = String(cur + 1).padStart(2, "0");
  }
  $("[data-step-prev]").addEventListener("click", () => go(cur - 1));
  $("[data-step-next]").addEventListener("click", () => go(cur + 1));
  steps.forEach((s, k) => s.addEventListener("click", () => go(k)));
})();

/* ---------- preguntas frecuentes ---------- */
(function faq() {
  const list = $("#faqList");
  if (!list || typeof FAQS === "undefined") return;
  list.innerHTML = FAQS.map((f, i) => `
    <div class="faq__item reveal" style="--d:${Math.min(i, 5) * .05}s">
      <h3>
        <button class="faq__q" id="faq-q${i}" aria-expanded="false" aria-controls="faq-a${i}">
          <span>${esc(f.q)}</span><span class="faq__ico" aria-hidden="true"></span>
        </button>
      </h3>
      <div class="faq__a" id="faq-a${i}" role="region" aria-labelledby="faq-q${i}"><div><p>${esc(f.a)}</p></div></div>
    </div>`).join("");
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
  }), { threshold: .12 });
  $$(".faq__item", list).forEach(it => io.observe(it));

  list.addEventListener("click", e => {
    const q = e.target.closest(".faq__q");
    if (!q) return;
    const open = q.getAttribute("aria-expanded") === "true";
    $$(".faq__q", list).forEach(b => { b.setAttribute("aria-expanded", "false"); b.closest(".faq__item").classList.remove("is-open"); });
    if (!open) { q.setAttribute("aria-expanded", "true"); q.closest(".faq__item").classList.add("is-open"); }
  });
})();

/* ---------- contacto ---------- */
const ICON = {
  phone: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 8l9 6 9-6"/></svg>',
  pin: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
};
const rows = [];
if (CONFIG.phone) rows.push(["Teléfono", CONFIG.phoneLabel || CONFIG.phone, `tel:+${CONFIG.phone}`, ICON.phone]);
if (CONFIG.email) rows.push(["Correo", CONFIG.email, `mailto:${CONFIG.email}`, ICON.mail]);
if (CONFIG.address) rows.push(["Ubicación", CONFIG.address, CONFIG.mapsLink || null, ICON.pin]);
if (CONFIG.hours) rows.push(["Horario", CONFIG.hours, null, ICON.clock]);
$("#contactList").innerHTML = rows.map(([k, v, href, ico]) => {
  const inner = `<span class="contact__ico">${ico}</span><span><span class="contact__k">${esc(k)}</span><span class="contact__v">${esc(v)}</span></span>`;
  const ext = href && href.startsWith("http") ? ' target="_blank" rel="noopener"' : "";
  return `<li>${href ? `<a href="${esc(href)}"${ext}>${inner}</a>` : `<span class="row">${inner}</span>`}</li>`;
}).join("");

/* ---------- mapa ---------- */
(function map() {
  const frame = $("#mapFrame");
  if (!frame) return;
  if (CONFIG.mapsLat && CONFIG.mapsLng) {
    frame.src = `https://maps.google.com/maps?q=${CONFIG.mapsLat},${CONFIG.mapsLng}&z=16&output=embed&hl=es`;
  } else {
    $("#ubicacion").hidden = true;
    return;
  }
  $("#mapAddress").textContent = CONFIG.address || "";
  $("#mapLink").href = CONFIG.mapsLink || `https://www.google.com/maps/search/?api=1&query=${CONFIG.mapsLat},${CONFIG.mapsLng}`;
})();
