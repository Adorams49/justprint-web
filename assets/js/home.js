/* ==========================================================
   Just Print — página principal
   ========================================================== */

/* ---------- servicios: lista debajo del carrusel circular ----------
   Cada servicio es un enlace real a su página (sirve sin JavaScript y para Google);
   con JavaScript abre la ventana de detalle, igual que tocar el carrusel. */
const svcIndex = $("#svcIndex");
svcIndex.innerHTML = SERVICES.map((s, i) => `
  <li class="reveal" style="--accent:${s.color};--d:${(i % 4) * .05}s">
    <a href="servicios/${s.id}.html" data-id="${s.id}" aria-haspopup="dialog">
      <strong>${esc(s.title)}</strong>
      <span>${esc(s.sub)}</span>
    </a>
  </li>`).join("");
(function () {
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
  }), { threshold: .12, rootMargin: "0px 0px -6% 0px" });
  $$("li.reveal", svcIndex).forEach(c => io.observe(c));
})();

/* ---------- ventana de detalle ---------- */
const sheet = $("#sheet");
const panel = $(".sheet__panel", sheet);
const sheetBackdrop = $(".sheet__backdrop", sheet);
const sheetMobile = window.matchMedia("(max-width: 640px)");
let lastFocus = null, originEl = null;

/* De dónde nace la ventana y hacia dónde regresa (--fx/--fy/--fs del estado cerrado en el CSS).
   Escritorio: desde la tarjeta tocada. Celular: desde el borde inferior, como las hojas de iPhone. */
function setSheetOrigin() {
  if (sheetMobile.matches || !originEl || !document.contains(originEl)) {
    panel.style.setProperty("--fx", "0px");
    panel.style.setProperty("--fy", sheetMobile.matches ? "calc(100% + 24px)" : "60px");
    panel.style.setProperty("--fs", sheetMobile.matches ? "1" : ".94");
    return;
  }
  const r = originEl.getBoundingClientRect();
  const pw = panel.offsetWidth, ph = panel.offsetHeight;          // offset*: sin la transformación
  panel.style.setProperty("--fx", (r.left + r.width / 2 - (panel.offsetLeft + pw / 2)).toFixed(1) + "px");
  panel.style.setProperty("--fy", (r.top + r.height / 2 - (panel.offsetTop + ph / 2)).toFixed(1) + "px");
  panel.style.setProperty("--fs", clamp(r.width / pw, .2, 1).toFixed(3));
}
function clearDragStyles() {
  panel.style.transform = panel.style.transition = "";
  sheetBackdrop.style.opacity = sheetBackdrop.style.transition = "";
}

function openSheet(id, fromEl) {
  const s = SERVICES.find(x => x.id === id);
  if (!s) return;
  lastFocus = document.activeElement;
  originEl = fromEl || null;
  panel.style.setProperty("--accent", s.color);
  $("#sheetImg").src = `assets/img/m-${s.img}.webp`;
  $("#sheetImg").alt = s.title;
  $("#sheetEyebrow").textContent = s.tag;
  $("#sheetTitle").textContent = s.title;
  $("#sheetText").innerHTML = s.text.map(t => `<p>${esc(t)}</p>`).join("");
  $("#sheetList").innerHTML = s.list.map(t => `<li>${esc(t)}</li>`).join("");
  $("#sheetPage").href = `servicios/${s.id}.html`;
  $(".sheet__body", sheet).scrollTop = 0;
  // ubicar el estado cerrado en la tarjeta SIN animar ese salto, y luego abrir desde ahí
  clearDragStyles();
  panel.style.transition = "none";
  setSheetOrigin();
  void panel.offsetWidth;
  panel.style.transition = "";
  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-locked");
  requestAnimationFrame(() => panel.focus({ preventScroll: true }));
}
function closeSheet() {
  if (!sheet.classList.contains("is-open")) return;
  setSheetOrigin();                      // regresa al mismo lugar del que salió
  sheet.classList.remove("is-open");
  sheet.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-locked");
  if (lastFocus) lastFocus.focus({ preventScroll: true });
}
svcIndex.addEventListener("click", e => {
  const a = e.target.closest("a[data-id]");
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;   // Ctrl/⌘+clic sigue abriendo la página completa
  e.preventDefault();
  openSheet(a.dataset.id, a);
});

/* Celular: arrastrar la hoja hacia abajo para cerrarla (desde el asa o la foto).
   Sigue al dedo 1:1; al soltar se usa la velocidad para proyectar a dónde iba:
   si la lanzaste o pasó casi la mitad, se cierra; si no, regresa con un resorte. */
(function sheetDrag() {
  let start = null, samples = [], stop = null, h = 1;
  const y = () => { const m = /translateY\((-?[\d.]+)px\)/.exec(panel.style.transform); return m ? +m[1] : 0; };
  const set = v => {
    panel.style.transform = `translateY(${v.toFixed(1)}px)`;
    sheetBackdrop.style.opacity = String(clamp(1 - v / h));
  };
  panel.addEventListener("pointerdown", e => {
    if (!sheetMobile.matches || !sheet.classList.contains("is-open") || e.button > 0) return;
    if (!e.target.closest(".sheet__grabber, .sheet__media")) return;
    if (stop) { stop(); stop = null; }          // se puede volver a agarrar a medio camino
    h = panel.offsetHeight;
    start = { y: e.clientY, base: y(), id: e.pointerId, dragging: false };
    samples = [{ v: start.base, t: performance.now() }];
  });
  panel.addEventListener("pointermove", e => {
    if (!start || e.pointerId !== start.id) return;
    if (!start.dragging) {
      if (Math.abs(e.clientY - start.y) < 8) return;   // pequeño umbral antes de decidir que es un arrastre
      start.dragging = true; start.y = e.clientY;
      try { panel.setPointerCapture(e.pointerId); } catch (err) { /* sin captura: igual funciona dentro del panel */ }
      panel.style.transition = sheetBackdrop.style.transition = "none";
    }
    let v = start.base + (e.clientY - start.y);
    if (v < 0) v = rubberband(v, h);                     // hacia arriba: resistencia, no se despega
    set(v);
    samples.push({ v, t: performance.now() }); if (samples.length > 6) samples.shift();
  });
  function release(e) {
    if (!start || e.pointerId !== start.id) return;
    const was = start.dragging; start = null;
    if (!was) return;
    const from = y(), vel = velocityOf(samples);
    if (from + project(vel) > h * .45) {
      stop = spring({ from, to: h + 40, velocity: Math.max(vel, 0), response: .3, onUpdate: set, onDone: () => {
        stop = null;
        panel.style.transition = "none";               // ya está fuera de la pantalla: cerrar sin otra animación
        closeSheet();
        requestAnimationFrame(() => requestAnimationFrame(clearDragStyles));
      } });
    } else {
      // rebote solo si venía con impulso (regla de Apple); si no, regresa sin pasarse
      stop = spring({ from, to: 0, velocity: vel, response: .35, damping: Math.abs(vel) > 400 ? .8 : 1, onUpdate: set,
        onDone: () => { stop = null; clearDragStyles(); } });
    }
  }
  panel.addEventListener("pointerup", release);
  panel.addEventListener("pointercancel", release);
})();
sheet.addEventListener("click", e => { if (e.target.closest("[data-close]")) closeSheet(); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && sheet.classList.contains("is-open")) closeSheet();
});
$("#sheetCta").addEventListener("click", closeSheet);

/* ---------- galería "Nuestro trabajo": versión simple ----------
   Una tira de fotos con scroll horizontal. Es lo que se ve si el navegador no tiene
   WebGL; cuando sí lo tiene, la isla de React la reemplaza por el Morph Slider. */
(function workStrip() {
  const strip = $("#workStrip");
  if (!strip || typeof GALLERY === "undefined") return;
  strip.innerHTML = GALLERY.map(g => `
    <a class="work__shot" href="servicios/${esc(g.service)}.html">
      <img src="assets/img/${esc(g.img)}" alt="${esc(g.title)}" loading="lazy" decoding="async">
    </a>`).join("");
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
if (counter) counter.textContent = counter.dataset.count = SERVICES.length;   // siempre igual a los servicios de la página
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
  const list = $(".steps");
  if (!steps.length) return;
  let cur = 0;
  function setActive(i) { steps.forEach((s, k) => s.classList.toggle("is-active", k === i)); }
  // Reserva el alto del paso más largo: sin esto la sección crece y se encoge al cambiar de paso.
  function reserve() {
    list.classList.add("is-measuring");
    list.style.minHeight = "";
    let h = 0;
    steps.forEach((_, k) => { setActive(k); h = Math.max(h, list.offsetHeight); });
    setActive(cur);
    list.style.minHeight = h + "px";
    void list.offsetHeight;   // aplica el estado antes de devolver las transiciones
    list.classList.remove("is-measuring");
  }
  function go(i) {
    cur = (i + steps.length) % steps.length;
    setActive(cur);
    imgs.forEach((im, k) => im.classList.toggle("is-active", k === cur));
    if (count) count.textContent = String(cur + 1).padStart(2, "0");
    document.dispatchEvent(new CustomEvent("jp:step", { detail: cur }));   // motion.js lo anima
  }
  reserve();
  window.addEventListener("resize", reserve);
  if (document.fonts) document.fonts.ready.then(reserve);
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
  clock: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  copy: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>'
};
const mapsUrl = CONFIG.mapsLink || (CONFIG.mapsLat && CONFIG.mapsLng ? `https://www.google.com/maps/search/?api=1&query=${CONFIG.mapsLat},${CONFIG.mapsLng}` : null);
const rows = [];   // [etiqueta, valor, enlace, ícono, texto para copiar]
if (CONFIG.phone) rows.push(["Teléfono", CONFIG.phoneLabel || CONFIG.phone, `tel:+${CONFIG.phone}`, ICON.phone, CONFIG.phoneLabel || "+" + CONFIG.phone]);
if (CONFIG.email) rows.push(["Correo", CONFIG.email, `mailto:${CONFIG.email}`, ICON.mail, CONFIG.email]);
if (CONFIG.address) rows.push(["Ubicación", CONFIG.address, mapsUrl, ICON.pin]);
if (CONFIG.hours && CONFIG.hours.length) rows.push(["Horario", CONFIG.hours, null, ICON.clock]);
$("#contactList").innerHTML = rows.map(([k, v, href, ico, copy]) => {
  const value = [].concat(v).map(esc).join("<br>");   // un arreglo = una fila por elemento
  const inner = `<span class="contact__ico">${ico}</span><span><span class="contact__k">${esc(k)}</span><span class="contact__v">${value}</span></span>`;
  const ext = href && href.startsWith("http") ? ' target="_blank" rel="noopener"' : "";
  const btn = copy ? `<button class="copy-btn" type="button" data-copy="${esc(copy)}" aria-label="Copiar ${esc(k.toLowerCase())}" title="Copiar">${ICON.copy}</button>` : "";
  return `<li${copy ? ' class="has-copy"' : ""}>${href ? `<a href="${esc(href)}"${ext}>${inner}</a>` : `<span class="row">${inner}</span>`}${btn}</li>`;
}).join("");

/* Copiar teléfono o correo con un aviso de confirmación (en una computadora "Llamar" o
   "Escribir correo" pueden no hacer nada si no hay teléfono o correo configurado). */
const toastEl = document.createElement("div");
toastEl.className = "toast";
toastEl.setAttribute("role", "status");
toastEl.setAttribute("aria-live", "polite");
document.body.appendChild(toastEl);
let toastTimer = 0;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2200);
}
$("#contactList").addEventListener("click", async e => {
  const b = e.target.closest(".copy-btn");
  if (!b) return;
  try { await navigator.clipboard.writeText(b.dataset.copy); toast(`Copiado: ${b.dataset.copy}`); }
  catch (err) { toast("No se pudo copiar"); }
});

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
