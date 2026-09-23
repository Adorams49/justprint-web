/* ==========================================================
   Just Print — comportamiento común (todas las páginas)
   tema claro/oscuro · menú · reveal · redes · volver arriba
   ========================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.remove("no-js");
$$("[data-year]").forEach(e => { e.textContent = new Date().getFullYear(); });

/* ---------- tema claro / oscuro ---------- */
(function theme() {
  const root = document.documentElement;
  const btn = $("#themeToggle");
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const saved = () => { try { return localStorage.getItem("jp-theme"); } catch (e) { return null; } };

  function apply(t) {
    root.dataset.theme = t;
    if (btn) {
      btn.setAttribute("aria-label", t === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
      btn.setAttribute("aria-pressed", t === "dark");
    }
  }
  apply(root.dataset.theme === "dark" ? "dark" : "light");

  if (btn) btn.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.classList.add("theme-anim");           // transición suave solo al cambiar
    apply(next);
    try { localStorage.setItem("jp-theme", next); } catch (e) { /* sin almacenamiento: no pasa nada */ }
    setTimeout(() => root.classList.remove("theme-anim"), 600);
  });

  // si la persona nunca eligió, seguimos el tema del sistema
  mq.addEventListener("change", e => { if (!saved()) apply(e.matches ? "dark" : "light"); });
})();

/* ---------- nav ---------- */
(function nav() {
  const bar = $("#nav"), burger = $("#burger"), links = $("#navLinks");
  if (!bar) return;
  const onScroll = () => bar.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (!burger) return;
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  links.addEventListener("click", e => {
    if (e.target.closest("a")) {
      links.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });
})();

/* ---------- títulos que suben palabra por palabra ---------- */
(function splitTitles() {
  $$(".h2.reveal").forEach(h => {
    let i = 0;
    (function walk(node) {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span"), inner = document.createElement("span");
            w.className = "w";
            inner.textContent = part;
            inner.style.setProperty("--i", i++);
            w.appendChild(inner);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    })(h);
    h.classList.add("split");
  });
})();

/* ---------- reveal al hacer scroll ---------- */
(function reveal() {
  const els = $$(".reveal");
  if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("is-in")); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    });
  }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
  els.forEach(el => io.observe(el));
})();

/* ---------- redes sociales ----------
   Sin enlace (vacío en config.js) → ícono inerte, no lleva a ningún lado. */
(function socials() {
  const ICONS = {
    facebook: ['Facebook', '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z"/></svg>'],
    instagram: ['Instagram', '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>']
  };
  const html = Object.keys(ICONS).map(k => {
    const [name, svg] = ICONS[k];
    const url = (typeof SOCIAL !== "undefined" && SOCIAL[k]) || "";
    return url
      ? `<a class="social" href="${esc(url)}" target="_blank" rel="noopener" aria-label="${name}">${svg}</a>`
      : `<span class="social social--off" role="img" aria-label="${name} (próximamente)">${svg}</span>`;
  }).join("");
  $$("[data-socials]").forEach(el => { el.innerHTML = html; });
})();

/* ---------- volver arriba ---------- */
(function toTop() {
  const b = $("#toTop");
  if (!b) return;
  const onScroll = () => b.classList.toggle("is-on", window.scrollY > 700);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  b.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
})();

/* ---------- barra de progreso de lectura ---------- */
(function progress() {
  const bar = document.createElement("div");
  bar.className = "progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.prepend(bar);
  const on = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? clamp(window.scrollY / h) : 0})`;
  };
  window.addEventListener("scroll", on, { passive: true });
  window.addEventListener("resize", on);
  on();
})();

/* ---------- sub-menú pegajoso (páginas de servicio) ---------- */
(function subnav() {
  const sn = $("#subnav"), hero = $(".phero");
  if (!sn || !hero) return;
  const links = $$(".subnav__links a", sn);
  const targets = links.map(a => document.querySelector(a.getAttribute("href")));
  const on = () => {
    sn.classList.toggle("is-on", window.scrollY > hero.offsetHeight - 90);
    let cur = -1;
    targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top <= window.innerHeight * .4) cur = i; });
    links.forEach((a, i) => a.classList.toggle("is-active", i === cur));
  };
  window.addEventListener("scroll", on, { passive: true });
  on();
})();
